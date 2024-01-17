import { Constructor } from "@aster-js/core";
import { IIoCContainerBuilder, IIoCModule, IoCContainerBuilder, IoCModuleConfigureDelegate, IoCModuleSetupDelegate, ISetupIoCContainerBuilder, ServiceIdentifier, ServiceScope, ServiceSetupDelegate } from "@aster-js/ioc";
import { IApplicationPartBuilder } from "../abstraction/iapplication-part-builder";
import { INavigationHandler } from "../routing/inavigation-handler";
import { RouterAction } from "../routing/irouting-handler";
import { ActionRoutingHandler } from "../routing/routing-handlers";
import { SetupIoCContainerBuilder } from "./setup-application-part-builder";
import { ApplicationPart } from "./application-part";
import { IApplicationPart } from "../abstraction";

export class ApplicationPartBuilder implements IApplicationPartBuilder {
    private readonly _innerBuilder: IIoCContainerBuilder;

    constructor(
        partName: string,
        private readonly _source: IIoCModule
    ) {
        this._innerBuilder = _source.createChildScope(partName);
        this.initDefaults();
    }

    protected initDefaults(): void {
        this.setupMany(INavigationHandler, x => x.start());
    }

    addAction(path: string, action: RouterAction): void {
        this.configure(x =>
            x.addScoped(ActionRoutingHandler, {
                baseArgs: [path, action],
                scope: ServiceScope.container
            })
        );
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
        return this.createApplicationPart(this._source, this._innerBuilder);
    }

    protected createApplicationPart(parent: IIoCModule, iocBuilder: IIoCContainerBuilder): IApplicationPart {
        return new ApplicationPart(parent, iocBuilder);
    }
}
