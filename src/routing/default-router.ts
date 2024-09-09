import { ILogger, ServiceContract, findRootService } from "@aster-js/ioc";
import { Query } from "@aster-js/iterators";

import { IApplicationPart } from "../abstraction/iapplication-part";
import { ApplicationPartUtils } from "../application-part/application-part-utils";

import { IRoutingHandlerInvoker } from "./abstraction/irouting-handler-invoker";
import { IRoutingTable } from "./abstraction/irouting-table";
import { IRoutingHandler } from "./abstraction/irouting-handler";
import { IRouter, RoutingResult } from "./abstraction/irouter";

import { RouteResolutionCursor } from "./route-resolution-cusor";
import { SearchValues, RouteValues, RouteData } from "./route-data";
import { RoutingConstants } from "./routing-constants";
import { Route } from "./route";
import { Path } from "./path";
import { RoutingInvocationContext } from "./routing-invocation-context";

@ServiceContract(IRouter)
export class DefaultRouter implements IRouter {
    private _current?: RouteData;
    private _rootPath: string = "/";

    constructor(
        @IRoutingTable private readonly _routingTable: IRoutingTable,
        @IApplicationPart private readonly _application: IApplicationPart,
        @IRoutingHandlerInvoker private readonly _handlerInvoker: IRoutingHandlerInvoker,
        @ILogger private readonly _logger: ILogger
    ) { }

    async eval(url: string, defaults: RouteValues = {}): Promise<RoutingResult> {
        url = Path.coerce(url);

        this._logger.debug(`Evaluating route "{url}"`, url);
        try {
            // Relative path
            if (url.startsWith(RoutingConstants.RELATIVE_CHAR)) {
                const result = await this.evalRelativePath(url, defaults);
                if (!result.success) return result;

                return RoutingResult.success(this._rootPath + result.relativeUrl.substring(1), SearchValues.empty);
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
            const result = await this.evalCore(path, search, defaults);
            if (result.success) {
                this._rootPath = "/";
            }
            return result;
        }
        finally {
            this._logger.debug(`Route "{url}" evaluation completed`, url);
        }
    }

    private evalRelativePath(relativeUrl: string, defaults: RouteValues): Promise<RoutingResult> {
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

    private evalCore(path: Path, search: SearchValues, defaults: RouteValues): Promise<RoutingResult> {
        const ctx = new RouteResolutionCursor(path, path.relative);
        return this.handleCore(ctx, defaults, search);
    }

    async handle(root: string, cursor: RouteResolutionCursor, ctx: RoutingInvocationContext): Promise<boolean> {
        this._rootPath = root;
        cursor = new RouteResolutionCursor(cursor, true);
        const { success } = await this.handleCore(cursor, ctx.data.values, ctx.data.query, ctx);
        return success;
    }

    async handleCore(cursor: RouteResolutionCursor, values: RouteValues, search: SearchValues, parent?: RoutingInvocationContext): Promise<RoutingResult> {
        const routeHandler = await this.resolveHandler(cursor);

        if (!routeHandler) {
            this._logger.warn(null, `No match found for the remaining route path: {relativeUrl}`, cursor.remainingPath, ...this._routingTable.getPaths());
            return { success: false, reason: `No match found for the remaining route path: ${cursor.remainingPath}` };
        }

        const [route, handler] = routeHandler;

        const localValues = route.getRouteValues(cursor);
        const data = RouteData.create(route, values, localValues, search);
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

    private async invokeHandler(cursor: RouteResolutionCursor, ctx: RoutingInvocationContext): Promise<RoutingResult> {
        if (this._current?.path === ctx.data.path
            || await this._handlerInvoker.invoke(cursor, ctx)
        ) {
            this._current = ctx.data;

            const root = this._rootPath + ctx.data.path.substring(1);
            await this.invokeChildren(root, cursor, ctx);

            const sourcePath = cursor.sourcePath;
            this._logger.debug("{RoutedUrl} routing completed successfully.", sourcePath);

            return RoutingResult.success(sourcePath, ctx.data.query);
        }
        return RoutingResult.failure("Error while invoking routing handler");
    }

    private async invokeChildren(root:string, cursor: RouteResolutionCursor, ctx: RoutingInvocationContext): Promise<void> {
        const activeChildren = [...ApplicationPartUtils.scanActiveChildren(this, { includeSelf: false, nested: false })];
        if (activeChildren.length !== 0) {
            let flag = true;
            for (const [activeRoute, activePart, child] of activeChildren) {
                if (activeRoute !== ctx.data.route) {
                    this._application.desactivate(activePart.name);
                }
                else if (flag && await child.handle(root, cursor, ctx)) {
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
        }
        else if (cursor.remaining !== 0) {
            this._logger.warn(null, "No child to handle the remaining route path: {relativeUrl}", cursor.remainingPath);
        }
        else {
            this._logger.debug("Routing completed successfully.");
        }
    }
}
