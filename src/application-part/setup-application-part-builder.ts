import type { Constructor } from "@aster-js/core";
import { IIoCContainerBuilder, IIoCModule, ISetupIoCContainerBuilder, IoCModuleConfigureDelegate, IoCModuleSetupDelegate, ServiceIdentifier, ServiceSetupDelegate, SetupErrorHandlerDelegate } from "@aster-js/ioc";
import { IAppConfigureHandler, IApplicationPartBuilder } from "../abstraction";
import { RouterAction, ServiceRouterAction } from "../routing";

export class SetupIoCContainerBuilder implements IApplicationPartBuilder {

    constructor(
        private readonly _appBuilder: IApplicationPartBuilder,
        private readonly _iocBuilder: ISetupIoCContainerBuilder
    ) {
    }

    continueWithoutAwaiting(): IIoCContainerBuilder {
        this._iocBuilder.continueWithoutAwaiting();
        return this._appBuilder;
    }

    catch(errorHandler: SetupErrorHandlerDelegate): IIoCContainerBuilder {
        this._iocBuilder.catch(errorHandler);
        return this._appBuilder;
    }

    use(action: IoCModuleSetupDelegate): ISetupIoCContainerBuilder {
        return this._appBuilder.use(action);
    }

    addPart(path: string, configHandler: Constructor<IAppConfigureHandler>): IApplicationPartBuilder {
        return this._appBuilder.addPart(path, configHandler);
    }

    addAction<T>(path: string, serviceId: ServiceIdentifier, action: ServiceRouterAction<T>): IApplicationPartBuilder;
    addAction(path: string, action: RouterAction): IApplicationPartBuilder;
    addAction(path: string, actionOrServiceId: RouterAction | ServiceIdentifier, action?: ServiceRouterAction): IApplicationPartBuilder {
        return this._appBuilder.addAction(path, <ServiceIdentifier>actionOrServiceId, action!);
    }

    setup<T>(serviceId: ServiceIdentifier<T>, action: ServiceSetupDelegate<T>, required?: boolean): ISetupIoCContainerBuilder;
    setup<T>(ctor: Constructor<T>, action: ServiceSetupDelegate<T>, required?: boolean): ISetupIoCContainerBuilder;
    setup<T>(serviceIdOrCtor: ServiceIdentifier<T> | Constructor<T>, action: ServiceSetupDelegate<T>, required: boolean = true): ISetupIoCContainerBuilder {
        return this._appBuilder.setup(serviceIdOrCtor as ServiceIdentifier<T>, action, required);
    }

    setupMany<T>(serviceId: ServiceIdentifier<T>, action: ServiceSetupDelegate<T>, currentScopeOnly?: boolean): ISetupIoCContainerBuilder;
    setupMany<T>(ctor: Constructor<T>, action: ServiceSetupDelegate<T>, currentScopeOnly?: boolean): ISetupIoCContainerBuilder;
    setupMany<T>(serviceIdOrCtor: ServiceIdentifier<T> | Constructor<T>, action: ServiceSetupDelegate<T>, currentScopeOnly: boolean = true): ISetupIoCContainerBuilder {
        return this._appBuilder.setupMany(serviceIdOrCtor as ServiceIdentifier<T>, action, currentScopeOnly);
    }

    configure(action: IoCModuleConfigureDelegate): IIoCContainerBuilder {
        return this._appBuilder.configure(action);
    }

    build(): IIoCModule {
        return this._appBuilder.build();
    }
}
