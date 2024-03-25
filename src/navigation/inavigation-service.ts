import { AppServiceId } from "../abstraction/app-service-id";

export const INavigationService = AppServiceId<INavigationService>("INavigationService");

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
    navigate(relativeUrl: string, replace?: boolean): Promise<void>;
}
