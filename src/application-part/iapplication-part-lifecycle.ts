import { Constructor } from "@aster-js/core";
import { AppServiceId } from "../abstraction/app-service-id";

export const IApplicationPartLifecycle = AppServiceId<IApplicationPartLifecycle>("IApplicationPartLifecycle");

/** Enumerate all application hooks supported in the lifecycle of any service registered in an ApplicationPart */
export namespace ApplicationPartLifecycleHooks {

    /** Symbol used to identify a method called during setup */
    export const setup = Symbol("setup");

    /** Symbol used to identify a method when the part is activated */
    export const activated = Symbol("activated");

    /** Symbol used to identify a method when the part is put in background */
    export const deactivated = Symbol("deactivated");

    export function invoke(target: IApplicationPartLifecycle, hook: ApplicationPartLifecycleHook): Promise<void> {
        const callback = target[hook];
        return typeof callback === "function" ? callback.apply(target) : Promise.resolve();
    }

    export function hasAny(ctor: Constructor) {
        return setup in ctor.prototype
            || activated in ctor.prototype
            || deactivated in ctor.prototype;
    }
}

export type ApplicationPartLifecycleHook =
    typeof ApplicationPartLifecycleHooks.setup
    | typeof ApplicationPartLifecycleHooks.activated
    | typeof ApplicationPartLifecycleHooks.deactivated


/** Interface and service id that enumerate all default hooks for services in the context of an application part */
export interface IApplicationPartLifecycle {
    /** Called during setup */
    [ApplicationPartLifecycleHooks.setup]?(): Promise<void>;
    /** Called when the part is activated */
    [ApplicationPartLifecycleHooks.activated]?(): Promise<void>;
    /** Called when the part is put in background */
    [ApplicationPartLifecycleHooks.deactivated]?(): Promise<void>;
}
