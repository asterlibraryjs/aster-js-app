import { ILogger, Many, ServiceContract } from "@aster-js/ioc";

import { IApplicationPart } from "../abstraction/iapplication-part";

import { IRoutingHandlerInvoker } from "./abstraction/irouting-handler-invoker";
import { IRoutingObserver } from "./abstraction/irouting-observer";

import { RouteResolutionCursor } from "./route-resolution-cusor";
import { RoutingInvocationContext } from "./routing-invocation-context";

@ServiceContract(IRoutingHandlerInvoker)
export class DefaultRoutingHandlerInvoker implements IRoutingHandlerInvoker {

    constructor(
        @IApplicationPart private readonly _application: IApplicationPart,
        @Many(IRoutingObserver) private readonly _observers: IRoutingObserver[],
        @ILogger private readonly _logger: ILogger
    ) { }

    async invoke(cursor: RouteResolutionCursor, ctx: RoutingInvocationContext): Promise<boolean> {
        this.onDidUrlMatch(cursor, ctx);

        try {
            await Promise.allSettled(this._observers.map(x => x.onRoutingDidBegin(ctx)));
            await ctx.handler.handle(ctx);
            await Promise.allSettled(this._observers.map(x => x.onRoutingDidComplete(ctx)));
            return true;
        }
        catch (err) {
            await Promise.allSettled(this._observers.map(x => x.onRoutingDidFail(err, ctx)));
            this.onHandlerError(err, cursor, ctx);
            return false;
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
