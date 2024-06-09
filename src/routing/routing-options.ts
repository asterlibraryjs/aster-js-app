import { AppServiceId } from "../abstraction/app-service-id";

export const RoutingOptions = AppServiceId<RoutingOptions>("RoutingOptions");

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
    /**
     * The route name used to store part route data.
     *
     * Default is "/{part}/".
     */
    readonly partRouteValueName: string
};

export const defaultRoutingOptions: RoutingOptions = {
    linkTagSelectors: "a",
    assignLocationForUnhandled: true,
    partRouteValueName: "part"
}
