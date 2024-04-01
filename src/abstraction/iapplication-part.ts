import { Constructor } from "@aster-js/core";
import { IIoCModule } from "@aster-js/ioc";
import { IAppConfigureHandler, AppConfigureDelegate } from "./iapp-configure-handler";
import { AppServiceId } from "./app-service-id";

export const IApplicationPart = AppServiceId<IApplicationPart>( "IApplicationPart");

/** Represents a part of an application based on a IoC Container and using it a registry for all its services. */
export interface IApplicationPart extends IIoCModule {
    /** Active child application part. This state is related to IApplicationPartLifecycle */
    readonly activeChild: IApplicationPart | undefined;
    /** Returns the child application part that use the provided name */
    getChild(name: string): IApplicationPart | undefined;
    /** Configure, Setup, Start and Activate a child application part */
    load(name: string, configHandler: Constructor<IAppConfigureHandler> | AppConfigureDelegate): Promise<IApplicationPart>;
    /** Make a part of the application `activated` to call proper hooks from IApplicationPartLifecycle */
    activate(name: string): Promise<void>;
}
