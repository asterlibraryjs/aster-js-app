import {
    IIoCContainerBuilder,
    IIoCModule,
    IServiceDescriptor,
    ServiceCollection,
    ServiceLifetime,
    ServiceScope
} from "@aster-js/ioc";
import { IApplicationPart } from "../abstraction";
import { ApplicationPartLifecycleHooks, IApplicationPartLifecycle } from "./iapplication-part-lifecycle";
import { ApplicationPartLifecycleWrapper } from "./application-part-lifecycle-wrapper";
import {
    ContainerAmbientRouteValuesObserverFactory,
    ContainerRouteData,
    ContainerRouteDataRoutingObserverFactory,
    DefaultRouteParser,
    DefaultRouter,
    DefaultRoutingHandlerInvoker,
    DefaultRoutingTable,
    PartRouteData
} from "../routing";
import { DefaultNavigationService } from "../navigation/navigation-service";
import { DefaultUrlValueConverterFactory } from "../routing/url-value-converter/default-url-value-converter-factory";
import { DefaultUrlValueValidatorFactory } from "../routing/url-value-validator/default-url-value-validator-factory";

export function createApplicationPartModule(app: IApplicationPart, builder: IIoCContainerBuilder): IIoCModule {
    return builder
        .configure(x => configureDefaultAppPartServices(app, x))
        .setup(IApplicationPart,
            x => ApplicationPartLifecycleHooks.invoke(x, ApplicationPartLifecycleHooks.setup),
            true)
        .build();
}

function configureDefaultAppPartServices(app: IApplicationPart, services: ServiceCollection): void {
    services.addInstance(IApplicationPart, app, { scope: ServiceScope.container })
        .tryAddScoped(PartRouteData, { scope: ServiceScope.container })
        .tryAddScopedFactory(ContainerRouteDataRoutingObserverFactory, { scope: ServiceScope.container })
        .tryAddScopedFactory(ContainerAmbientRouteValuesObserverFactory, { scope: ServiceScope.container })
        .tryAddScoped(ContainerRouteData, { scope: ServiceScope.container })
        .tryAddScoped(DefaultNavigationService, { scope: ServiceScope.container, baseArgs: [history] })
        .tryAddSingleton(DefaultUrlValueConverterFactory)
        .tryAddSingleton(DefaultUrlValueValidatorFactory)
        .tryAddSingleton(DefaultRouteParser)
        .tryAddSingleton(DefaultRoutingTable, { scope: ServiceScope.container })
        .tryAddScoped(DefaultRouter, { scope: ServiceScope.container })
        .tryAddScoped(DefaultRoutingHandlerInvoker, { scope: ServiceScope.container });

    for (const desc of filterImplicitLifecycleImpl(services)) {
        if (desc.lifetime === ServiceLifetime.transient) {
            throw new Error("Application Part Lifecycle cannot be managed for transient services");
        }
        services.addScoped(ApplicationPartLifecycleWrapper, { baseArgs: [desc], scope: ServiceScope.container });
    }
}

function* filterImplicitLifecycleImpl(services: ServiceCollection): Iterable<IServiceDescriptor> {
    for (const desc of services) {
        if (ApplicationPartLifecycleHooks.hasAny(desc.ctor)
            && desc.serviceId !== IApplicationPartLifecycle) {
            yield desc;
        }
    }
}
