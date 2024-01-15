import { ILogger, IServiceProvider, LogLevel, Many, ServiceContract } from "@aster-js/ioc";
import { IApplicationPart } from "../abstraction/iapplication-part";
import { Route } from "./iroute-segment";
import { IRouter } from "./irouter";
import { IRoutingHandler, RouterAction } from "./irouting-handler";
import { RouteResolutionContext } from "./route-resolution-context";
import { RouteValues, RoutingInvocationContext } from "./routing-invocation-context";

type RouteEntry = readonly [Route, RouterAction];

@ServiceContract(IRouter)
export class DefaultRouter implements IRouter {
    private readonly _self: this; // this is used to avoid bad reference by proxies

    constructor(
        @Many(IRoutingHandler) private readonly _handlers: IRoutingHandler[],
        @IApplicationPart private readonly _application: IApplicationPart,
        @ILogger private readonly _logger: ILogger
    ) {
        this._self = this;
    }

    createChild(services: IServiceProvider): IRouter {
        return services.createInstance(ScopedRouter, this._self);
    }

    eval(path: string): Promise<void> | false {
        const ctx = new RouteResolutionContext(path);
        const actions = [...this.resolveActions(ctx)];
        if (actions.length) {
            return this.evalCore(actions);
        }
        return false;
    }

    protected async evalCore(actions: [IRoutingHandler, RouteValues][]): Promise<void> {
        for (const [handler, values] of actions) {
            try {
                await handler.handle(values, this._application);
            }
            catch (err) {
                this._logger.log(LogLevel.error, "Error handled during route handler invocation", err)
            }
        }
    }

    *resolveActions(ctx: RouteResolutionContext): Iterable<[IRoutingHandler, RouteValues]> {
        const search = new URLSearchParams(location.search);
        const params = Object.fromEntries(search);

        for (const h of this._handlers) {
            if (!h.route.isMatch(ctx)) continue;

            const values = h.route.getRouteValues(ctx);
            Object.assign(values, params);

            yield [h, values];
        }
    }
}
@ServiceContract(IRouter)
export class ScopedRouter extends DefaultRouter implements IRouter {

    constructor(
        private readonly _parent: DefaultRouter,
        @Many(IRoutingHandler) handlers: IRoutingHandler[],
        @IApplicationPart application: IApplicationPart,
        @ILogger logger: ILogger
    ) {
        super(handlers, application, logger);
    }

    *resolveActions(ctx: RouteResolutionContext): Iterable<[IRoutingHandler, RouteValues]> {
        yield* this._parent.resolveActions(ctx);
        yield* super.resolveActions(ctx);
    }
}
