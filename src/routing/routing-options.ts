import { ServiceIdentifier } from "@aster-js/ioc";

export const RoutingOptions = ServiceIdentifier<RoutingOptions>({ name: "@aster-js/app/RoutingOptions", unique: true });

/**
 * Options to configure routing services.
 */
export type RoutingOptions = {
    /**
     * The list of supported href tags that should intercept navigation and try to use the router.
     */
    readonly linkTagSelectors: string;
    /**
     * Assign location when router failed handle the navigation.
     *
     * Value must be false to handle not found pages.
     *
     * Default is true.
     */
    readonly assignLocationForUnhandled: boolean;
};

export const defaultRoutingOptions: RoutingOptions = {
    linkTagSelectors: "a",
    assignLocationForUnhandled: true
}
