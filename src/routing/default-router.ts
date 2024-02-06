import { ILogger, LogLevel, Many, ServiceContract, findRootService } from "@aster-js/ioc";
import { Query } from "@aster-js/iterators";
import { IApplicationPart } from "../abstraction/iapplication-part";
import { IContainerRouteData } from "./icontainer-route-data";
import { IRouter } from "./irouter";
import { IRoutingHandler } from "./irouting-handler";
import { RouteResolutionContext } from "./route-resolution-context";
import { QueryValues, RouteValues } from "./routing-invocation-context";
import { RoutingConstants } from "./routing-constants";

@ServiceContract(IRouter)
export class DefaultRouter implements IRouter {
    private _lastUrlEvaluated?: URL;

    constructor(
        @Many(IRoutingHandler) private readonly _handlers: IRoutingHandler[],
        @IApplicationPart private readonly _application: IApplicationPart,
        @IContainerRouteData private readonly _routeData: IContainerRouteData,
        @ILogger private readonly _logger: ILogger
    ) {
    }

    *getHandlers(): Iterable<IRoutingHandler> {
        yield* this._handlers;
    }

    async *getActiveChildren(nested: boolean): AsyncIterable<IRouter> {
        const active = this._application.activeChild;
        if (active) {
            let router = active.services.get(IRouter);
            if (router) {
                yield router;
                if (nested) yield* router.getActiveChildren(true);
            }
        }
    }

    eval(url: string, defaults: RouteValues = {}): Promise<boolean> {
        let path: string;
        let query: QueryValues;
        if (url.startsWith(RoutingConstants.RELATIVE_CHAR)) {
            const finalUrl = new URL(url, location.origin)
            path = finalUrl.pathname;
            query = QueryValues.parse(finalUrl.search);
        }
        else {
            const root = findRootService(IRouter, this._application);
            if (root && root !== this) {
                return root.eval(url, defaults);
            }
            // Non relative path
            const finalUrl = new URL(url, location.origin);
            if (finalUrl.pathname === this._lastUrlEvaluated?.pathname) {
                return Promise.resolve(true);
            }
            this._lastUrlEvaluated = finalUrl;
            path = finalUrl.pathname;
            query = QueryValues.parse(finalUrl.search);
        }

        if (path.startsWith(RoutingConstants.SEGMENT_SEPARATOR)) path = path.substring(1);
        if (path.endsWith(RoutingConstants.SEGMENT_SEPARATOR)) path = path.substring(0, path.length - 1);

        const segments = path ? path.split(RoutingConstants.SEGMENT_SEPARATOR) : [];
        const ctx = new RouteResolutionContext(this, segments);

        return this.handle(ctx, defaults, query);
    }

    async handle(ctx: RouteResolutionContext, values: RouteValues, query: QueryValues): Promise<boolean> {
        const handler = await this.resolveHandler(ctx);

        if (!handler) {
            const handlerPaths = this._handlers.map(x => x.path);
            this._logger.warn(null, `No match found for the remaining route path: {relativeUrl}`, ctx.toString(), ...handlerPaths);
            return false;
        }

        await this.invokeHandler(handler, ctx, values, query);
        return true;
    }

    private async resolveHandler(ctx: RouteResolutionContext): Promise<IRoutingHandler | undefined> {
        if (ctx.initiator === this) {
            const children = this.getActiveChildren(true);
            return Query(children)
                .prepend(this)
                .flatMap(x => x.getHandlers())
                .filter(x => !x.route.relative)
                .findFirst(x => x.route.match(ctx));
        }
        return Query(this.getHandlers())
            .findFirst(x => x.route.match(ctx));
    }

    private async invokeHandler(handler: IRoutingHandler, ctx: RouteResolutionContext, values: RouteValues, query: QueryValues): Promise<void> {
        const relativeUrl = ctx.toString();
        const localValues = handler.route.getRouteValues(ctx);
        const mergedValues = Object.assign({}, values, localValues);

        const routeData = { values: mergedValues, query };

        this._logger.info(`Routing match url "{relativeUrl}" with route "{routePath}"`, relativeUrl, handler.path, routeData);
        try {
            this._routeData.setState(handler.route, mergedValues, query);
            await handler.handle(routeData, this._application);
        }
        catch (err) {
            this._logger.log(LogLevel.error, err, "Error handled during route handler invocation")
        }

        for await (const router of this.getActiveChildren(false)) {
            if (await router.handle(ctx, mergedValues, query)) break;
        }
    }
}
