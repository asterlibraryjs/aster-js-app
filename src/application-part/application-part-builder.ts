import { Constructor } from "@aster-js/core";
import { Delayed } from "@aster-js/async";
import { IIoCContainerBuilder, IIoCModule, IoCModuleConfigureDelegate, IoCModuleSetupDelegate, ISetupIoCContainerBuilder, resolveServiceId, ServiceIdentifier, ServiceScope, ServiceSetupDelegate } from "@aster-js/ioc";
import { IApplicationPartBuilder, IApplicationPart, IAppConfigureHandler, AppConfigureDelegate } from "../abstraction";
import { ServiceRouterAction, ServiceRoutingHandler, ActionRoutingHandler, RouterAction, IRoutingHandler } from "../routing";
import { PartLoaderRoutingHandler } from "../routing/routing-handlers/part-loader-routing-handler";
import { ControllerRoutingHandlerTag } from "../controller/controller-routing-handler-tag";
import { SetupIoCContainerBuilder } from "./setup-application-part-builder";

export abstract class ApplicationPartBuilder implements IApplicationPartBuilder {
    private readonly _innerBuilder: IIoCContainerBuilder;

    constructor(
        partName: string,
        private readonly _source: IIoCModule,
        private readonly _result: Delayed<IApplicationPart>
    ) {
        this._innerBuilder = _source.createChildScope(partName);
    }

    addPart(path: string, configHandler: Constructor<IAppConfigureHandler> | AppConfigureDelegate): IApplicationPartBuilder {
        const ctor = IAppConfigureHandler.resolve(configHandler);
        this.configure(x =>
            x.addScoped(PartLoaderRoutingHandler, {
                baseArgs: [path, ctor],
                scope: ServiceScope.container
            })
        );
        return this;
    }

    addController<T>(ctor: Constructor<T>): IApplicationPartBuilder {
        const handlers = ControllerRoutingHandlerTag.get(ctor.prototype);
        this.configure(x => {
            const serviceId = resolveServiceId(ctor);
            x.addScoped(serviceId, ctor, { scope: ServiceScope.container });

            for (const handler of handlers) {
                x.addScoped(IRoutingHandler, handler, { scope: ServiceScope.container });
            }
        });
        return this;
    }

    addAction<T>(path: string, serviceId: ServiceIdentifier, action: ServiceRouterAction<T>): IApplicationPartBuilder;
    addAction(path: string, action: RouterAction): IApplicationPartBuilder;
    addAction(path: string, actionOrServiceId: RouterAction | ServiceIdentifier, action?: ServiceRouterAction): IApplicationPartBuilder {
        if (ServiceIdentifier.is(actionOrServiceId)) {
            this.configure(x =>
                x.addScoped(ServiceRoutingHandler, {
                    baseArgs: [path, actionOrServiceId, action],
                    scope: ServiceScope.container
                })
            );
        }
        else {
            this.configure(x =>
                x.addScoped(ActionRoutingHandler, {
                    baseArgs: [path, actionOrServiceId],
                    scope: ServiceScope.container
                })
            );
        }
        return this;
    }

    configure(action: IoCModuleConfigureDelegate): IIoCContainerBuilder {
        this._innerBuilder.configure(action);
        return this;
    }

    use(action: IoCModuleSetupDelegate): ISetupIoCContainerBuilder {
        const iocBuilder = this._innerBuilder.use(action);
        return new SetupIoCContainerBuilder(this, iocBuilder);
    }

    setupMany<T>(serviceId: ServiceIdentifier<T>, action: ServiceSetupDelegate<T>, currentScopeOnly?: boolean | undefined): ISetupIoCContainerBuilder;
    setupMany<T>(ctor: Constructor<T, any[]>, action: ServiceSetupDelegate<T>, currentScopeOnly?: boolean | undefined): ISetupIoCContainerBuilder;
    setupMany(ctor: Constructor | ServiceIdentifier, action: ServiceSetupDelegate, currentScopeOnly?: boolean): ISetupIoCContainerBuilder {
        const iocBuilder = this._innerBuilder.setupMany(<Constructor>ctor, action, currentScopeOnly);
        return new SetupIoCContainerBuilder(this, iocBuilder);
    }

    setup<T>(serviceId: ServiceIdentifier<T>, action: ServiceSetupDelegate<T>, required?: boolean): ISetupIoCContainerBuilder;
    setup<T>(ctor: Constructor<T>, action: ServiceSetupDelegate<T>, required?: boolean): ISetupIoCContainerBuilder;
    setup<T>(ctor: Constructor | ServiceIdentifier, action: ServiceSetupDelegate, required?: boolean): ISetupIoCContainerBuilder {
        const iocBuilder = this._innerBuilder.setup(<Constructor>ctor, action, required);
        return new SetupIoCContainerBuilder(this, iocBuilder);
    }

    build(): IApplicationPart {
        const part = this.createApplicationPart(this._source, this._innerBuilder);
        this._result.set(part);
        return part;
    }

    protected abstract createApplicationPart(parent: IIoCModule, iocBuilder: IIoCContainerBuilder): IApplicationPart;
}
