import { IServiceDescriptor, IServiceProvider, ServiceContract } from "@aster-js/ioc";
import { ApplicationPartLifecycleHooks, IApplicationPartLifecycle } from "./iapplication-part-lifecycle";

@ServiceContract(IApplicationPartLifecycle)
export class ApplicationPartLifecycleWrapper implements IApplicationPartLifecycle {
    private readonly _instance: IApplicationPartLifecycle;

    constructor(
        readonly descriptor: IServiceDescriptor,
        @IServiceProvider serviceProvider: IServiceProvider
    ) {
        this._instance = <IApplicationPartLifecycle>serviceProvider.get(descriptor, true);
    }

    [ApplicationPartLifecycleHooks.setup](): Promise<void> {
        return ApplicationPartLifecycleHooks.invoke(this._instance, ApplicationPartLifecycleHooks.setup);
    }

    [ApplicationPartLifecycleHooks.activated](): Promise<void> {
        return ApplicationPartLifecycleHooks.invoke(this._instance, ApplicationPartLifecycleHooks.activated);
    }

    [ApplicationPartLifecycleHooks.deactivated](): Promise<void> {
        return ApplicationPartLifecycleHooks.invoke(this._instance, ApplicationPartLifecycleHooks.deactivated);
    }
}
