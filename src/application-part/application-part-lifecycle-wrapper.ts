import { DisposableHost, IDisposable } from "@aster-js/core";
import { ILogger, IServiceDescriptor, IServiceProvider, ServiceContract } from "@aster-js/ioc";
import {
    ApplicationPartLifecycleHook,
    ApplicationPartLifecycleHooks,
    IApplicationPartLifecycle
} from "./iapplication-part-lifecycle";
import { IApplicationPart } from "../abstraction/iapplication-part";
import { Iterables } from "@aster-js/iterators";

function cast(value: unknown): value is IDisposable {
    return typeof value === "object" && value !== null && Reflect.has(value, Symbol.dispose);
}

@ServiceContract(IApplicationPartLifecycle)
export class ApplicationPartLifecycleWrapper extends DisposableHost implements IApplicationPartLifecycle {
    private readonly _instance: IApplicationPartLifecycle;
    private _activatedDisposables: IDisposable[] | undefined;

    constructor(
        private readonly _descriptor: IServiceDescriptor,
        @ILogger private readonly _logger: ILogger,
        @IServiceProvider serviceProvider: IServiceProvider
    ) {
        super();
        this._instance = <IApplicationPartLifecycle>serviceProvider.get(_descriptor, true);
    }

    async [ApplicationPartLifecycleHooks.setup](app: IApplicationPart): Promise<void> {
        const result = await this.invokeLifecycleMethod(ApplicationPartLifecycleHooks.setup, app);
        const disposableSetups = this.extractDisposables(result);
        this.registerForDispose(...disposableSetups);
    }

    async [ApplicationPartLifecycleHooks.activated](app: IApplicationPart): Promise<void> {
        const result = await this.invokeLifecycleMethod(ApplicationPartLifecycleHooks.activated, app);
        this._activatedDisposables = [...this.extractDisposables(result)];
    }

    async [ApplicationPartLifecycleHooks.deactivated](app: IApplicationPart): Promise<void> {
        IDisposable.safeDisposeAll(this._activatedDisposables);
        this._activatedDisposables = undefined;

        await this.invokeLifecycleMethod(ApplicationPartLifecycleHooks.deactivated, app);
    }

    private async invokeLifecycleMethod(hook: ApplicationPartLifecycleHook, app: IApplicationPart): Promise<unknown> {
        this._logger.debug(`Calling hook "{hook}" on service {serviceId}`, hook.description, this._descriptor.serviceId);

        const callback = this._instance[hook];
        if (callback) return callback.apply(this._instance, [app]);
    }

    private* extractDisposables(result: unknown): Iterable<IDisposable> {
        if (result) {
            if (cast(result)) {
                yield result;
            } else if (Iterables.cast(result)) {
                for (const value of result) {
                    if (cast(value)) yield value;
                }
            }
        }
    }
}
