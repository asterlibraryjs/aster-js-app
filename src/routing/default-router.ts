import { ILogger, ServiceContract, findRootService } from "@aster-js/ioc";
import { Query } from "@aster-js/iterators";

import { IApplicationPart } from "../abstraction/iapplication-part";
import { ApplicationPartUtils } from "../application-part/application-part-utils";

import { IRoutingHandlerInvoker } from "./abstraction/irouting-handler-invoker";
import { IRoutingTable } from "./abstraction/irouting-table";
import { IRoutingHandler } from "./abstraction/irouting-handler";
import { IRouter } from "./abstraction/irouter";

import { RouteResolutionCursor } from "./route-resolution-cusor";
import { SearchValues, RouteValues, RouteData } from "./route-data";
import { RoutingConstants } from "./routing-constants";
import { Route } from "./route";
import { Path } from "./path";
import { RoutingInvocationContext } from "./routing-invocation-context";

@ServiceContract(IRouter)
export class DefaultRouter implements IRouter {
    private _current?: [Path, SearchValues];

    constructor(
        @IRoutingTable private readonly _routingTable: IRoutingTable,
        @IApplicationPart private readonly _application: IApplicationPart,
        @IRoutingHandlerInvoker private readonly _handlerInvoker: IRoutingHandlerInvoker,
        @ILogger private readonly _logger: ILogger
    ) { }

    async eval(url: string, defaults: RouteValues = {}): Promise<boolean> {
        url = Path.coerce(url);

        this._logger.debug(`Evaluating route "{url}"`, url);
        try {
            // Relative path
            if (url.startsWith(RoutingConstants.RELATIVE_CHAR)) {
                return await this.evalRelativePath(url, defaults);
            }

            // Retrieve the root router to handle not relative path
            const root = findRootService(IRouter, this._application);
            if (root && root !== this) {
                return await root.eval(url, defaults);
            }

            // Non relative path (root router context)
            // This url may be relative or not
            const finalUrl = new URL(url, location.origin);

            const path = Path.parse(finalUrl.pathname);
            const search = SearchValues.parse(finalUrl.search);
            return await this.evalCore(path, search, defaults);
        }
        finally {
            this._logger.debug(`Route "{url}" evaluation completed`, url);
        }
    }

    private evalRelativePath(relativeUrl: string, defaults: RouteValues): Promise<boolean> {
        const idx = relativeUrl.indexOf(RoutingConstants.SEARCH_CHAR);
        if (idx === -1) {
            const path = Path.parse(relativeUrl, { relativeIndicator: RoutingConstants.RELATIVE_CHAR });
            return this.evalCore(path, SearchValues.empty, defaults);
        }

        const rawPath = relativeUrl.substring(0, idx);
        const rawSearch = relativeUrl.substring(idx + 1);

        const path = Path.parse(rawPath, { relativeIndicator: RoutingConstants.RELATIVE_CHAR });
        const search = SearchValues.parse(rawSearch);

        return this.evalCore(path, search, defaults);
    }

    private evalCore(path: Path, search: SearchValues, defaults: RouteValues): Promise<boolean> {
        if (this._current && this._current[0].equals(path) && SearchValues.areEquals(this._current[1], search)) {
            return Promise.resolve(true);
        }
        this._current = [path, search];
        const ctx = new RouteResolutionCursor(path, path.relative);
        return this.handleCore(ctx, defaults, search);
    }

    async handle(cursor: RouteResolutionCursor, ctx: RoutingInvocationContext): Promise<boolean> {
        cursor = new RouteResolutionCursor(cursor, true);
        return this.handleCore(cursor, ctx.data.values, ctx.data.query, ctx);
    }

    async handleCore(cursor: RouteResolutionCursor, values: RouteValues, search: SearchValues, parent?: RoutingInvocationContext): Promise<boolean> {
        const routeHandler = await this.resolveHandler(cursor);

        if (!routeHandler) {
            this._logger.warn(null, `No match found for the remaining route path: {relativeUrl}`, cursor.remainingPath, ...this._routingTable.getPaths());
            return false;
        }

        const [route, handler] = routeHandler;

        const [path, localValues] = route.getRouteValues(cursor);
        const data = RouteData.create(path, route, values, localValues, search);
        const ctx: RoutingInvocationContext = { data, handler, sourcePath: cursor.sourcePath, parent, app: this._application };
        return await this.invokeHandler(cursor, ctx);
    }

    /**
     * Returns a handler that matches the current route
     * @param ctx The route resolution context
     */
    private async resolveHandler(ctx: RouteResolutionCursor): Promise<readonly [Route, IRoutingHandler] | undefined> {
        if (ctx.relative) {
            return Query(this._routingTable.getHandlers())
                .findFirst(([route]) => route.match(ctx));
        }
        const children = ApplicationPartUtils.scanActiveChildren(this._routingTable, { includeSelf: true, nested: true });
        return Query(children)
            .flatMap(([, , x]) => x.getHandlers())
            .findFirst(([route]) => route.match(ctx));
    }

    private async invokeHandler(cursor: RouteResolutionCursor, ctx: RoutingInvocationContext): Promise<boolean> {
        if (await this._handlerInvoker.invoke(cursor, ctx)) {

            const activeChildren = [...ApplicationPartUtils.scanActiveChildren(this, { includeSelf: false, nested: false })];
            if (activeChildren.length !== 0) {
                let flag = true;
                for (const [activeRoute, activePart, child] of activeChildren) {
                    if (activeRoute !== ctx.data.route) {
                        this._application.desactivate(activePart.name);
                    }
                    else if (flag && await child.handle(cursor, ctx)) {
                        flag = false;
                        this._logger.debug("Child router handled the remaining route {path}", cursor.toString());
                    }
                    else if (this._application.activeChild === activePart) {
                        this._application.desactivate(activePart.name);
                    }
                }

                if (flag && cursor.remaining !== 0) {
                    this._logger.warn(null, "No match found for the remaining route path: {relativeUrl}", cursor.remainingPath);
                }

                return true;
            }

            if (cursor.remaining !== 0) {
                this._logger.warn(null, "No child to handle the remaining route path: {relativeUrl}", cursor.remainingPath);
                return true;
            }

            this._logger.debug("Routing completed successfully.");

            return true;
        }
        return false;
    }
}
