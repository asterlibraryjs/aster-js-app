import { ILogger, IServiceDescriptor, IServiceProvider, ServiceContract } from "@aster-js/ioc";
import { ApplicationPartLifecycleHook, ApplicationPartLifecycleHooks, IApplicationPartLifecycle } from "./iapplication-part-lifecycle";
import { IApplicationPart } from "../abstraction/iapplication-part";

@ServiceContract(IApplicationPartLifecycle)
export class ApplicationPartLifecycleWrapper implements IApplicationPartLifecycle {
    private readonly _instance: IApplicationPartLifecycle;

    constructor(
        private readonly _descriptor: IServiceDescriptor,
        @ILogger private readonly _logger: ILogger,
        @IServiceProvider serviceProvider: IServiceProvider
    ) {
        this._instance = <IApplicationPartLifecycle>serviceProvider.get(_descriptor, true);
    }

    [ApplicationPartLifecycleHooks.setup](app: IApplicationPart): Promise<void> {
        return this.invokeLifecycleMethod(ApplicationPartLifecycleHooks.setup, app);
    }

    [ApplicationPartLifecycleHooks.activated](app: IApplicationPart): Promise<void> {
        return this.invokeLifecycleMethod(ApplicationPartLifecycleHooks.activated, app);
    }

    [ApplicationPartLifecycleHooks.deactivated](app: IApplicationPart): Promise<void> {
        return this.invokeLifecycleMethod(ApplicationPartLifecycleHooks.deactivated, app);
    }

    private async invokeLifecycleMethod(hook: ApplicationPartLifecycleHook, app: IApplicationPart): Promise<void> {
        this._logger.debug(`Calling hook "{hook}" on service {serviceId}`, hook.description, this._descriptor.serviceId);

        const callback = this._instance[hook];
        if (callback) await callback.apply(this._instance, [app]);
    }
}
