import { ILogger, IServiceProvider, LogLevel, Many, ServiceContract } from "@aster-js/ioc";
import { IApplicationPart } from "../abstraction/iapplication-part";
import { Route } from "./route";
import { IRouter } from "./irouter";
import { IRoutingHandler, RouterAction } from "./irouting-handler";
import { RouteResolutionContext } from "./route-resolution-context";
import { QueryValues, RouteValues } from "./routing-invocation-context";
import { DisposableHost, IDisposable } from "@aster-js/core";

const SEGMENT_SEPARATOR = "/";

type RouteEntry = readonly [Route, RouterAction];

@ServiceContract(IRouter)
export class DefaultRouter extends DisposableHost implements IRouter {
    private readonly _self: this; // this is used to avoid bad reference by proxies
    private _children: DefaultRouter[];

    constructor(
        @Many(IRoutingHandler) private readonly _handlers: IRoutingHandler[],
        @IApplicationPart private readonly _application: IApplicationPart,
        @ILogger private readonly _logger: ILogger
    ) {
        super();
        this._self = this;
        this._children = [];
    }

    createChild(services: IServiceProvider): IRouter {
        const self = this._self;

        const router = services.createInstance(DefaultRouter);
        self._children.push(router);
        router.registerForDispose(
            IDisposable.create(() => {
                const idx = self._children.indexOf(router);
                self._children.splice(idx, 1);
            })
        );
        return router;
    }

    eval(url: string, defaults: RouteValues): Promise<void> | false {
        const parsedUrl = new URL(url);

        let path = parsedUrl.pathname;
        if (path.startsWith(SEGMENT_SEPARATOR)) path = path.substring(1);
        if (path.endsWith(SEGMENT_SEPARATOR)) path = path.substring(0, path.length - 2);

        const segments = path.split(SEGMENT_SEPARATOR);
        const ctx = new RouteResolutionContext(segments);

        const search = new URLSearchParams(parsedUrl.search);
        const query = Object.fromEntries(search);

        return this.evalContext(ctx, defaults, query);
    }

    private evalContext(ctx: RouteResolutionContext, values: RouteValues, query: QueryValues): Promise<void> | false {
        const handler = this._handlers.find(x => x.route.match(ctx));
        if (!handler) return false;
        return this.evalCore(handler, ctx, values, query);
    }

    private async evalCore(handler: IRoutingHandler, ctx: RouteResolutionContext, values: RouteValues, query: QueryValues): Promise<void> {
        const localValues = handler.route.getRouteValues(ctx);
        const mergedValues = Object.assign({}, values, localValues);

        try {
            await handler.handle({ query, values: mergedValues }, this._application);
        }
        catch (err) {
            this._logger.log(LogLevel.error, "Error handled during route handler invocation", err)
        }

        if (ctx.remaining !== 0) {
            for (const child of this._children) {
                const evalResult = child.evalContext(ctx, values, query);
                if (evalResult === false) continue;
                await evalResult;
            }
        }
    }
}
