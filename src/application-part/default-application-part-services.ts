
import { IIoCContainerBuilder, IIoCModule, IServiceDescriptor, ServiceCollection, ServiceScope } from "@aster-js/ioc";
import { IApplicationPart } from "../abstraction";
import { ApplicationPartLifecycleHooks, IApplicationPartLifecycle } from "./iapplication-part-lifecycle";
import { ApplicationPartLifecycleWrapper } from "./application-part-lifecycle-wrapper";
import { ContainerRouteData, DefaultRoutingHandlerInvoker, DefaultRouter, PartRouteData, DefaultRouteParser, DefaultRoutingTable, ContainerRouteDataRoutingObserverFactory } from "../routing";
import { DefaultNavigationService } from "../navigation/navigation-service";
import { DefaultUrlValueConverterFactory } from "../routing/url-value-converter/default-url-value-converter-factory";
import { DefaultUrlValueValidatorFactory } from "../routing/url-value-validator/default-url-value-validator-factory";

export function createApplicationPartModule(app: IApplicationPart, builder: IIoCContainerBuilder): IIoCModule {
    return builder
        .configure(x => configureDefaultAppPartServices(app, x))
        .setup(IApplicationPart, x => {
            ApplicationPartLifecycleHooks.invoke(x, ApplicationPartLifecycleHooks.setup)
        }, true)
        .build();
}

function configureDefaultAppPartServices(app: IApplicationPart, services: ServiceCollection): void {
    services.addInstance(IApplicationPart, app, { scope: ServiceScope.container })
        .tryAddScoped(PartRouteData, { scope: ServiceScope.container })
        .tryAddScopedFactory(ContainerRouteDataRoutingObserverFactory, { scope: ServiceScope.container })
        .tryAddScoped(ContainerRouteData, { scope: ServiceScope.container })
        .tryAddScoped(DefaultNavigationService, { scope: ServiceScope.container })
        .tryAddSingleton(DefaultUrlValueConverterFactory)
        .tryAddSingleton(DefaultUrlValueValidatorFactory)
        .tryAddSingleton(DefaultRouteParser)
        .tryAddSingleton(DefaultRoutingTable, { scope: ServiceScope.container })
        .tryAddScoped(DefaultRouter, { scope: ServiceScope.container })
        .tryAddScoped(DefaultRoutingHandlerInvoker, { scope: ServiceScope.container });

    for (const desc of extractImplicitLifecycleImpl(services)) {
        services.addTransient(ApplicationPartLifecycleWrapper, { baseArgs: [desc], scope: ServiceScope.container });
    }
}

function extractImplicitLifecycleImpl(services: ServiceCollection): IServiceDescriptor[] {
    const explicitLifeCycles = new Set();
    const implicitLifeCycles = [];

    for (const desc of services) {
        if (desc.serviceId === IApplicationPartLifecycle) {
            explicitLifeCycles.add(desc.targetType);
        }
        else if (ApplicationPartLifecycleHooks.hasAny(desc.ctor)) {
            implicitLifeCycles.push(desc);
        }
    }

    return implicitLifeCycles.filter(x => !explicitLifeCycles.has(x.targetType));
}
