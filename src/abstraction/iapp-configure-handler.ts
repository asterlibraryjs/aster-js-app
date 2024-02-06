import { Constructor } from "@aster-js/core";
import { IApplicationPart } from "./iapplication-part";
import { IApplicationPartBuilder } from "./iapplication-part-builder";

export const configure = Symbol("configure");

export interface IAppConfigureHandler {
    [configure](builder: IApplicationPartBuilder, host?: IApplicationPart): void;
}

export type AppConfigureDelegate = (builder: IApplicationPartBuilder, host?: IApplicationPart) => void;

export type AppConfigureType = Constructor<IAppConfigureHandler> | AppConfigureDelegate;

export namespace IAppConfigureHandler {
    export function create(callback: AppConfigureDelegate): Constructor<IAppConfigureHandler> {
        class CallbackAppConfigureHandler extends CallbackConfigureHandler {
            constructor() {
                super(callback);
            }
        }
        return CallbackAppConfigureHandler;
    }

    export function resolve(configHandler: AppConfigureType): Constructor<IAppConfigureHandler> {
        const proto = configHandler.prototype;
        if (proto && configure in proto) {
            return <Constructor<IAppConfigureHandler>>configHandler;
        }
        return IAppConfigureHandler.create(<AppConfigureDelegate>configHandler);
    }
}

export class CallbackConfigureHandler implements IAppConfigureHandler {
    constructor(private readonly _callback: AppConfigureDelegate) { }

    [configure](builder: IApplicationPartBuilder, host?: IApplicationPart): void {
        this._callback(builder, host);
    }
}
