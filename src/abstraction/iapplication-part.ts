import { Constructor } from "@aster-js/core";
import { IIoCModule } from "@aster-js/ioc";
import { IAppConfigureHandler, AppConfigureDelegate } from "./iapp-configure-handler";
import { AppServiceId } from "./app-service-id";
import { Route } from "../routing/route";

export const IApplicationPart = AppServiceId<IApplicationPart>( "IApplicationPart");

/** Represents a part of an application based on a IoC Container and using it a registry for all its services. */
export interface IApplicationPart extends IIoCModule {

    /**
     * Active child application part.
     * The active child is the part that is currently activated and running.
     */
    readonly activeChild: IApplicationPart | undefined;

    /**
     * Active child route. This state is related to IApplicationPartLifecycle
     * The active route is the route that is the reflection of current url.
     */
    readonly activeRoute: Route | undefined;

    /** Returns the child application part that use the provided name */
    getChild(name: string): IApplicationPart | undefined;

    /**
     * Load a new application part as a child of the current part and activate it
     * @param name The name of the part
     * @param route The route that will be used to activate the part
     * @param configHandler The configuration handler used to configure the part
     * @returns The loaded part
     */
    load(name: string, route: Route, configHandler: Constructor<IAppConfigureHandler> | AppConfigureDelegate): Promise<IApplicationPart>;

    /**
     * Make a part of the application `activated` to call proper hooks from IApplicationPartLifecycle
     * This will also desactivate the current active part if any calling the proper hooks from IApplicationPartLifecycle
     */
    activate(name: string, route: Route): Promise<void>;

    /** Make a part of the application `deactivated` to call proper hooks from IApplicationPartLifecycle */
    desactivate(name: string): Promise<void>;
}
