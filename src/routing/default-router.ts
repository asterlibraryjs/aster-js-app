import { ILogger, IServiceProvider, LogLevel, Many, ServiceContract } from "@aster-js/ioc";
import { IApplicationPart } from "../abstraction/iapplication-part";
import { IRouter } from "./irouter";
import { IRoutingHandler } from "./irouting-handler";
import { RouteResolutionContext } from "./route-resolution-context";
import { QueryValues, RouteValues } from "./routing-invocation-context";
import { DisposableHost, IDisposable } from "@aster-js/core";

const SEGMENT_SEPARATOR = "/";

@ServiceContract(IRouter)
export class DefaultRouter implements IRouter {
    constructor(
        @Many(IRoutingHandler) private readonly _handlers: IRoutingHandler[],
        @IApplicationPart private readonly _application: IApplicationPart,
        @ILogger private readonly _logger: ILogger
    ) {
    }

    eval(url: string, defaults: RouteValues = {}): Promise<void> | false {
        const parsedUrl = new URL(url);

        let path = parsedUrl.pathname;
        if (path.startsWith(SEGMENT_SEPARATOR)) path = path.substring(1);
        if (path.endsWith(SEGMENT_SEPARATOR)) path = path.substring(0, path.length - 2);

        const segments = path.split(SEGMENT_SEPARATOR);
        const ctx = new RouteResolutionContext(segments);

        const search = new URLSearchParams(parsedUrl.search);
        const query = Object.fromEntries(search);

        return this.handle(ctx, defaults, query);
    }

    handle(ctx: RouteResolutionContext, values: RouteValues, query: QueryValues): Promise<void> | false {
        const handler = this._handlers.find(x => x.route.match(ctx));
        if (!handler) return false;
        return this.invokeHandler(handler, ctx, values, query);
    }

    private async invokeHandler(handler: IRoutingHandler, ctx: RouteResolutionContext, values: RouteValues, query: QueryValues): Promise<void> {
        const localValues = handler.route.getRouteValues(ctx);
        const mergedValues = Object.assign({}, values, localValues);

        try {
            await handler.handle({ query, values: mergedValues }, this._application);
        }
        catch (err) {
            this._logger.log(LogLevel.error, "Error handled during route handler invocation", err)
        }

        if (ctx.remaining === 0) return;

        for await (const childApp of this._application) {
            const router = childApp.services.get(IRouter);
            if (!router) continue;

            const evalResult = router.handle(ctx, values, query);
            if (evalResult === false) continue;

            await evalResult;
            break;
        }
    }
}
