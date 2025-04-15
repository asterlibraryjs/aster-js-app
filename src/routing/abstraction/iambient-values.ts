import { AppServiceId } from "../../abstraction/app-service-id";
import { SearchValues } from "../route-data";

/**
 * Service in charge of managing Ambient Route Values
 * used to set default values injected to navigation.
 */
export const IAmbientValues = AppServiceId<IAmbientValues>("IAmbientValues");
export interface IAmbientValues {

    /** Gets the current ambient values */
    readonly values: SearchValues;

    /** Sets the current ambient values */
    setValues(values: SearchValues): void;

    /** Fix the provided url to add ambient values */
    coerceUrl(url: URL): void;
}

/**
 *
 */
export const IAmbientRouteValuesObserver = AppServiceId<IAmbientRouteValuesObserver>("IAmbientRouteValuesObserver");
export interface IAmbientRouteValuesObserver {
    onDidAmbientValuesChange(): void;
}
