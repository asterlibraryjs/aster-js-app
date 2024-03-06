import { Constructor } from "@aster-js/core";
import { IIoCContainerBuilder, ServiceIdentifier } from "@aster-js/ioc";
import { RouterAction, ServiceRouterAction } from "../routing";
import { AppConfigureDelegate, IAppConfigureHandler } from "./iapp-configure-handler";

/**
 * Represents a builder for application parts.
 * Application Parts are isolated dependency injection container accessible through routing.<
 */
export interface IApplicationPartBuilder extends IIoCContainerBuilder {
    /**
     * Register an action to run when the provided route match
     * @param path Route path
     * @param serviceId Service to call
     * @param action Action to call when the routeer hit the route
     */
    addAction<T>(path: string, serviceId: ServiceIdentifier, action: ServiceRouterAction<T>): IApplicationPartBuilder;
    /**
     * Register an action to run when the provided route match
     * @param path Route path
     * @param action Action to call when the routeer hit the route
     */
    addAction(path: string, action: RouterAction): IApplicationPartBuilder;
    /**
     * Add a child application part accessible through the provided route path.
     * It will be possible to configure this child app through a builder and register custom services and custom setups
     *
     * **IMPORTANT: Use the "part" route value name to identify where the part name is retreived**
     * @param path Route path that must declare at least 1 segment with `/:part/`
     * @param configHandler Configure handler type of callback
     */
    addPart(path: string, configHandler: Constructor<IAppConfigureHandler> | AppConfigureDelegate): IApplicationPartBuilder;

    addController(ctor: Constructor): IApplicationPartBuilder;
}
