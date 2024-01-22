import { ServiceIdentifier } from "@aster-js/ioc";

export const INavigationHandler = ServiceIdentifier<INavigationHandler>("INavigationHandler");

/**
 * Service id that allow to implement custom navigation handler to avoid default behavior.
 * An example is handling any navigation triggered by a navigation event.
 */
export interface INavigationHandler {
    /** Start the handler when the application is activated */
    start(): void;
    /** Stop the handler when the application is deactivated */
    stop(): void;
}
