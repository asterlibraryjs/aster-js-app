import { ServiceIdentifier } from "@aster-js/ioc";

export const IApplicationPartLifecycle = ServiceIdentifier<IApplicationPartLifecycle>("IApplicationPartLifecycle");

/** Symbol used to identify a method called during setup */
export const setup = Symbol("setup");

/** Symbol used to identify a method when the part is activated */
export const activated = Symbol("activated");

/** Symbol used to identify a method when the part is put in background */
export const deactivated = Symbol("deactivated");

/** Interface and service id that enumerate all default hooks for services in the context of an application part */
export interface IApplicationPartLifecycle {
    /** Called during setup */
    [setup](): Promise<void>;
    /** Called when the part is activated */
    [activated](): Promise<void>;
    /** Called when the part is put in background */
    [deactivated](): Promise<void>;
}
