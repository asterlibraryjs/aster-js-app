import { ServiceIdentifier } from "@aster-js/ioc";


export const NavigationHandlerOptions = ServiceIdentifier<NavigationHandlerOptions>("NavigationHandlerOptions");

export type NavigationHandlerOptions = {
    /**
     * The list of supported href tags.
     */
    readonly additionalLinkTagSelectors?: string;
    /**
     * Avoid assigning location for unhandled navigations.
     *
     * Default is false.
     */
    readonly disableAssignLocationForUnhandled?: boolean;
};
