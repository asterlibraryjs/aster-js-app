import { ILogger, ServiceContract } from "@aster-js/ioc";

import { IRoutingHandlerInvoker } from "./irouting-handler-invoker";
import { IRoutingHandler } from "./irouting-handler";
import { RouteResolutionCursor } from "./route-resolution-cusor";
import { IApplicationPart } from "../abstraction";
import { RouteData } from "./route-data";

@ServiceContract(IRoutingHandlerInvoker)
export class DefaultRoutingHandlerInvoker implements IRoutingHandlerInvoker {

    constructor(
        @IApplicationPart private readonly _application: IApplicationPart,
        @ILogger private readonly _logger: ILogger
    ) { }

    async invoke(handler: IRoutingHandler, { sourcePath, remainingPath: relativePath }: RouteResolutionCursor, routeData: RouteData): Promise<void> {
        this.onDidUrlMatch(handler, sourcePath, relativePath, routeData);

        try {
            await handler.handle(routeData, this._application);
        }
        catch (err) {
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
