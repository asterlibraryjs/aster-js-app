import { Constructor } from "@aster-js/core";
import { IApplicationPart } from "./iapplication-part";
import { IApplicationPartBuilder } from "./iapplication-part-builder";

export interface IAppConfigureHandler {
    configure(builder: IApplicationPartBuilder, host?: IApplicationPart): void;
}

export type AppConfigureDelegate = (builder: IApplicationPartBuilder, host?: IApplicationPart) => void;

export namespace IAppConfigureHandler {
    export function create(configure: AppConfigureDelegate): Constructor<IAppConfigureHandler> {
        class CallbackAppConfigureHandler implements IAppConfigureHandler {
            configure(builder: IApplicationPartBuilder, host?: IApplicationPart): void {
                configure(builder, host);
            }
        }
        return CallbackAppConfigureHandler;
    }
}

export class CallbackConfigureHandler implements IAppConfigureHandler {
    constructor(readonly configure: AppConfigureDelegate) { }
}
