import { ServiceIdentity } from "@aster-js/ioc";
import { asserts } from "@aster-js/core";
import { IApplicationPart } from "../abstraction";

export type ApplicationPartOptions = {
    readonly includeSelfContainer?: boolean;
    readonly nested?: boolean;
}

export namespace ApplicationPartUtils {
    /**
     * Scan all the downstream hierarchy to return all implementations instance of the specified service.
     * @param svc Service to scan
     * @param includeSelf Include the current service container level in the scan
     * @param nested Indicate whether or not it should return nested children or only direct children
     */
    export function* scanActiveChildren<T>(svc: T, { includeSelfContainer, nested }: ApplicationPartOptions = {}): Iterable<T> {
        const identity = ServiceIdentity.get(svc);

        asserts.ensure(identity, "Service must have an identity");

        const app = identity.owner.get(IApplicationPart, true);
        if (includeSelfContainer) {
            for (const found of app.services.getAll(identity.desc.serviceId, true)) {
                yield found;
            }
        }

        let { activeChild } = app;
        while (activeChild) {
            for (const found of activeChild.services.getAll(identity.desc.serviceId, true)) {
                yield found;
            }

            if (!nested) break;

            activeChild = activeChild.activeChild;
        }
    }
}
