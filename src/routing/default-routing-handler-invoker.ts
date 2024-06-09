import { ILogger, Many, ServiceContract } from "@aster-js/ioc";

import { IApplicationPart } from "../abstraction/iapplication-part";

import { IRoutingHandlerInvoker } from "./abstraction/irouting-handler-invoker";
import { IRoutingHandler } from "./abstraction/irouting-handler";
import { IRoutingObserver } from "./abstraction/irouting-observer";
import { RouteData } from "./route-data/route-data";

import { RouteResolutionCursor } from "./route-resolution-cusor";

@ServiceContract(IRoutingHandlerInvoker)
export class DefaultRoutingHandlerInvoker implements IRoutingHandlerInvoker {

    constructor(
        @IApplicationPart private readonly _application: IApplicationPart,
        @Many(IRoutingObserver) private readonly _observers: IRoutingObserver[],
        @ILogger private readonly _logger: ILogger
    ) { }

    async invoke(handler: IRoutingHandler, { sourcePath, remainingPath: relativePath }: RouteResolutionCursor, routeData: RouteData): Promise<void> {
        this.onDidUrlMatch(handler, sourcePath, relativePath, routeData);

        try {
            await Promise.allSettled(this._observers.map(x => x.onRoutingDidBegin(handler, routeData, this._application)));
            await handler.handle(routeData, this._application);
            await Promise.allSettled(this._observers.map(x => x.onRoutingDidComplete(handler, routeData, this._application)));
        }
        catch (err) {
            await Promise.allSettled(this._observers.map(x => x.onRoutingDidFail(handler, routeData, this._application)));
            this.onHandlerError(err, handler, sourcePath, relativePath, routeData);
        }
    }

    private onDidUrlMatch(handler: IRoutingHandler, sourcePath: string, relativePath: string, routeData: RouteData): void {
        if (sourcePath !== relativePath) {
            this._logger.info(`Routing match relative path "{relativePath}" in path "{path}" with route "{routePath}"`, relativePath, sourcePath, handler.path, routeData);
        }
        else {
            this._logger.info(`Routing match path "{path}" with route "{routePath}"`, sourcePath, handler.path, routeData);
        }
    }

    private onHandlerError(err: unknown, handler: IRoutingHandler, sourcePath: string, relativePath: string, routeData: RouteData): void {
        if (sourcePath !== relativePath) {
            this._logger.error(err, `Error handled during route handler invocation on relative path "{relativePath}" in path "{path}" with route "{routePath}"`, relativePath, sourcePath, handler.path, routeData);
        }
        else {
            this._logger.error(err, `Error handled during route handler invocation on path "{path}" with route "{routePath}"`, sourcePath, handler.path, routeData);
        }
    }
}
