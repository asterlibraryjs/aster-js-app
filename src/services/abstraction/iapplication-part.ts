import { Constructor } from "@aster-js/core";
import { IIoCModule, ServiceIdentifier } from "@aster-js/ioc";
import { IAppConfigureHandler } from "./iapp-configure-handler";
import { IApplicationPartBuilder } from "./iapplication-part-builder";

export const IApplicationPart = ServiceIdentifier<IApplicationPart>("IApplicationPart");

export interface IApplicationPart extends IIoCModule {

    load(name: string, handlerCtor: Constructor<IAppConfigureHandler>): Promise<void>;

    createChildScope(name: string): IApplicationPartBuilder;
}
