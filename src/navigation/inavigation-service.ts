import { ServiceIdentifier } from "@aster-js/ioc";

export const INavigationService = ServiceIdentifier<INavigationService>({ name: "@aster-js/app/INavigationService", unique: true });

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
