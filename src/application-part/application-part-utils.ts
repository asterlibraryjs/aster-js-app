import { ServiceIdentity } from "@aster-js/ioc";
import { asserts } from "@aster-js/core";
import { IApplicationPart } from "../abstraction";

export type ApplicationPartOptions = {
    readonly includeSelf?: boolean;
    readonly nested?: boolean;
}

export namespace ApplicationPartUtils {
    /**
     * Scan all the downstream hierarchy to return all implementations instance of the specified service.
     * @param svc Service to scan
     * @param includeSelf Include the current service in the scan
     * @param nested Indicate whether or not it should return nested children or only direct children
     */
    export function* scanActiveChildren<T>(svc: T, {includeSelf, nested}: ApplicationPartOptions = {}): Iterable<T> {
        if (includeSelf) yield svc;

        const identity = ServiceIdentity.get(svc);
        asserts.ensure(identity, "Service must have an identity");

        const app = identity.owner.get(IApplicationPart, true);

        let active = app.activeChild;
        if (active) {
            yield* active.services.getAll(identity.desc.serviceId, true);

            if (nested) {
                active = app.activeChild;
            }
        }
    }
}
