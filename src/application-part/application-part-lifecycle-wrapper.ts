import { ILogger, IServiceDescriptor, IServiceProvider, ServiceContract } from "@aster-js/ioc";
import { ApplicationPartLifecycleHook, ApplicationPartLifecycleHooks, IApplicationPartLifecycle } from "./iapplication-part-lifecycle";

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

    [ApplicationPartLifecycleHooks.setup](): Promise<void> {
        return this.invokeLifecycleMethod(ApplicationPartLifecycleHooks.setup);
    }

    [ApplicationPartLifecycleHooks.activated](): Promise<void> {
        return this.invokeLifecycleMethod(ApplicationPartLifecycleHooks.activated);
    }

    [ApplicationPartLifecycleHooks.deactivated](): Promise<void> {
        return this.invokeLifecycleMethod(ApplicationPartLifecycleHooks.deactivated);
    }

   async invokeLifecycleMethod(hook: ApplicationPartLifecycleHook): Promise<void> {
        this._logger.debug(`Calling hook "{hook}" on service {serviceId}`, hook.description, this._descriptor.serviceId);

        const callback = this._instance[hook];
        if (callback) await callback.apply(this._instance);
    }
}
