import { ILogger, Many, ServiceContract } from "@aster-js/ioc";

import { IApplicationPart } from "../abstraction/iapplication-part";

import { IRoutingHandlerInvoker } from "./abstraction/irouting-handler-invoker";
import { IRoutingHandler } from "./abstraction/irouting-handler";
import { IRoutingObserver } from "./abstraction/irouting-observer";
import { RouteData } from "./route-data/route-data";

import { RouteResolutionCursor } from "./route-resolution-cusor";
import { RoutingInvocationContext } from "./routing-invocation-context";

@ServiceContract(IRoutingHandlerInvoker)
export class DefaultRoutingHandlerInvoker implements IRoutingHandlerInvoker {

    constructor(
        @IApplicationPart private readonly _application: IApplicationPart,
        @Many(IRoutingObserver) private readonly _observers: IRoutingObserver[],
        @ILogger private readonly _logger: ILogger
    ) { }

    async invoke(cursor: RouteResolutionCursor, ctx: RoutingInvocationContext): Promise<void> {
        this.onDidUrlMatch(cursor, ctx);

        try {
            await Promise.allSettled(this._observers.map(x => x.onRoutingDidBegin(ctx)));
            await ctx.handler.handle(ctx);
            await Promise.allSettled(this._observers.map(x => x.onRoutingDidComplete(ctx)));
        }
        catch (err) {
            await Promise.allSettled(this._observers.map(x => x.onRoutingDidFail(ctx)));
            this.onHandlerError(err, cursor, ctx);
        }
    }

    private onDidUrlMatch(cursor: RouteResolutionCursor, ctx: RoutingInvocationContext): void {
        if (cursor.sourcePath !== cursor.remainingPath) {
            this._logger.info(
                `Routing match relative path "{relativePath}" in path "{path}" with route "{routePath}"`,
                cursor.remainingPath, cursor.sourcePath, ctx.handler.path, ctx.data
            );
        }
        else {
            this._logger.info(
                `Routing match path "{path}" with route "{routePath}"`,
                cursor.sourcePath, ctx.handler.path, ctx.data
            );
        }
    }

    private onHandlerError(err: unknown, cursor: RouteResolutionCursor, ctx: RoutingInvocationContext): void {
        if (cursor.sourcePath !== cursor.remainingPath) {
            this._logger.error(err,
                `Error handled during route handler invocation on relative path "{relativePath}" in path "{path}" with route "{routePath}"`,
                cursor.remainingPath, cursor.sourcePath, ctx.handler.path, ctx.data
            );
        }
        else {
            this._logger.error(err,
                `Error handled during route handler invocation on path "{path}" with route "{routePath}"`,
                cursor.sourcePath, ctx.handler.path, ctx.data
            );
        }
    }
}
