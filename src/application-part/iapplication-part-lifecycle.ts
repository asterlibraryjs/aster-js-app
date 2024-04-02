import { Constructor } from "@aster-js/core";
import { AppServiceId } from "../abstraction/app-service-id";
import { IApplicationPart } from "../abstraction/iapplication-part";
import { ILogger } from "@aster-js/ioc";

export const IApplicationPartLifecycle = AppServiceId<IApplicationPartLifecycle>("IApplicationPartLifecycle");

/** Enumerate all application hooks supported in the lifecycle of any service registered in an ApplicationPart */
export namespace ApplicationPartLifecycleHooks {

    /** Symbol used to identify a method called during setup */
    export const setup = Symbol("setup");

    /** Symbol used to identify a method when the part is activated */
    export const activated = Symbol("activated");

    /** Symbol used to identify a method when the part is put in background */
    export const deactivated = Symbol("deactivated");

    export async function invoke(part: IApplicationPart, hook: ApplicationPartLifecycleHook): Promise<boolean> {
        const promises = [];
        for (const svc of part.services.getAll(IApplicationPartLifecycle, true)) {
            const callback = svc[hook];
            if (typeof callback === "function") {
                const result = callback.apply(svc);
                promises.push(result);
            }
        }

        const allSettledResult = await Promise.allSettled(promises);
        const errors = [...filterRejectedReasons(allSettledResult)];
        if (errors.length === 0) return true;

        const logger = part.services.get(ILogger, true);
        for (const err of errors) {
            logger.error(err, "An error occured while calling lifecycle hook {symbol}", hook.description);
        }
        return false;
    }

    function* filterRejectedReasons(results: PromiseSettledResult<void>[]): Iterable<any> {
        for (const result of results) {
            if (result.status === "rejected") yield result.reason;
        }
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
