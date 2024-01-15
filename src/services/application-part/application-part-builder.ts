import { Constructor } from "@aster-js/core";
import { IIoCContainerBuilder, IIoCModule, IoCModuleConfigureDelegate, IoCModuleSetupDelegate, IServiceFactory, IServiceProvider, ISetupIoCContainerBuilder, Optional, ServiceIdentifier, ServiceScope, ServiceSetupDelegate } from "@aster-js/ioc";
import { IApplicationPartBuilder } from "../abstraction/iapplication-part-builder";
import { DefaultRouter } from "../routing/default-router";
import { INavigationHandler } from "../routing/inavigation-handler";
import { IRouter } from "../routing/irouter";
import { RouterAction } from "../routing/irouting-handler";
import { HyperlinkNavigationHandler } from "../routing/navigation-handlers";
import { ActionRoutingHandler } from "../routing/routing-handlers";
import { SetupIoCContainerBuilder } from "./setup-application-part-builder";

export class ApplicationPartBuilder implements IApplicationPartBuilder {
    private readonly _innerBuilder: IIoCContainerBuilder;

    constructor(
        partName: string,
        source: IIoCModule,
        @Optional(IRouter) private readonly _router?: IRouter
    ) {
        this._innerBuilder = source.createChildScope(partName);
        this.initDefaults();
    }

    protected initDefaults(): void {
        const router = this._router;

        if (router) {
            const desc = IServiceFactory.create(IRouter, (acc) => {
                const sp = acc.get(IServiceProvider, true);
                return router.createChild(sp);
            });
            this.configure(x => x.addScoped(desc));
        }
        else {
            this.configure(
                x => {
                    x.addSingleton(HyperlinkNavigationHandler)
                        .addScoped(DefaultRouter);
                }
            );
            this.setupMany(INavigationHandler, x => x.start());
        }
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

    build(): IIoCModule {
        return this._innerBuilder.build();
    }
}
