import { ILogger, Many, ServiceContract, findRootService } from "@aster-js/ioc";
import { Query } from "@aster-js/iterators";
import { EventEmitter, IEvent } from "@aster-js/events";

import { IApplicationPart } from "../abstraction/iapplication-part";

import { IRouter } from "./irouter";
import { IRoutingHandler } from "./irouting-handler";
import { RouteResolutionCursor } from "./route-resolution-cusor";
import { SearchValues, RouteValues, RouteData } from "./route-data";
import { RoutingConstants } from "./routing-constants";
import { Route } from "./route";
import { Path } from "./path";
import { IRoutingHandlerInvoker } from "./irouting-handler-invoker";
import { IRoutingTable } from "./irouting-table";
import { ApplicationPartUtils } from "../application-part/application-part-utils";

@ServiceContract(IRouter)
export class DefaultRouter implements IRouter {
    private readonly _onDidEvaluate: EventEmitter<[string, Route, RouteValues, SearchValues]> = new EventEmitter();
    private _current?: [Path, SearchValues];

    get onDidEvaluate(): IEvent<[string, Route, RouteValues, SearchValues]> { return this._onDidEvaluate.event; }

    constructor(
        @IRoutingTable private readonly _routingTable: IRoutingTable,
        @IApplicationPart private readonly _application: IApplicationPart,
        @IRoutingHandlerInvoker private readonly _handlerInvoker: IRoutingHandlerInvoker,
        @ILogger private readonly _logger: ILogger
    ) { }

    async eval(url: string, defaults: RouteValues = {}): Promise<boolean> {
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

    async handle(ctx: RouteResolutionCursor, values: RouteValues, search: SearchValues): Promise<boolean> {
        ctx = new RouteResolutionCursor(ctx, true);
        return this.handleCore(ctx, values, search);
    }

    async handleCore(ctx: RouteResolutionCursor, values: RouteValues, search: SearchValues): Promise<boolean> {
        const routeHandler = await this.resolveHandler(ctx);

        if (!routeHandler) {
            this._logger.warn(null, `No match found for the remaining route path: {relativeUrl}`, ctx.remainingPath, ...this._routingTable.getPaths());
            return false;
        }

        await this.invokeHandler(...routeHandler, ctx, values, search);
        return true;
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

    private async invokeHandler(route: Route, handler: IRoutingHandler, ctx: RouteResolutionCursor, values: RouteValues, query: SearchValues): Promise<void> {
        const [path, localValues] = route.getRouteValues(ctx);
        const routeData = RouteData.create(route, values, localValues, query);

        this._onDidEvaluate.emit(path, route, routeData.values, routeData.query);

        await this._handlerInvoker.invoke(handler, ctx, routeData);

        const activeChildren = [...ApplicationPartUtils.scanActiveChildren(this, { includeSelf: false, nested: false })];
        if (activeChildren.length !== 0) {
            let flag = true;
            for (const [activeRoute, activePart, child] of activeChildren) {
                if (activeRoute !== route) {
                    this._application.desactivate(activePart.name);
                }
                else if (flag && await child.handle(ctx, routeData.values, query)) {
                    flag = false;
                    this._logger.debug("Child router handled the remaining route {path}", ctx.toString());
                }
                else if (this._application.activeChild === activePart) {
                    this._application.desactivate(activePart.name);
                }
            }

            if (flag && ctx.remaining !== 0) {
                this._logger.warn(null, "No match found for the remaining route path: {relativeUrl}", ctx.remainingPath);
            }
        }
        else if (ctx.remaining !== 0) {
            this._logger.warn(null, "No child to handle the remaining route path: {relativeUrl}", ctx.remainingPath);
        }
        else {
            this._logger.debug("Routing completed successfully.");
        }
    }
}
