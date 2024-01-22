import { ServiceContract, ServiceIdentifier } from "@aster-js/ioc";

export const INavigationService = ServiceIdentifier<INavigationService>("INavigationService");

/**
 * Service ID and Implementation for a service that handle navigation properly
 * in the context of an Application Part
 */
export interface INavigationService {
    /**
     * Trigger a navigation in the browser
     * @param relativeUrl Relative url
     * @param replace Indicate whether or not it should replace current history entry
     */
    navigate(relativeUrl: string, replace: boolean): void;
}

@ServiceContract(INavigationService)
export class DefaultNavigationService implements INavigationService {

    navigate(relativeUrl: string, replace: boolean): void {
        const url = new URL(relativeUrl);
        if (replace) {
            history.replaceState({}, "", url);
        }
        else {
            history.pushState({}, "", url);
        }
    }
}
