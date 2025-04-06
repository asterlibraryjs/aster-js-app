import { AppServiceId } from "../../abstraction/app-service-id";
import { SearchValues } from "../route-data";

/**
 *
 */
export const IAmbientRouteValues = AppServiceId<IAmbientRouteValues>("IAmbientRouteValues");
export interface IAmbientRouteValues {

    /** Gets the current ambient values */
    readonly values: SearchValues;

    /** Sets the current ambient values */
    setValues(values: SearchValues): void;

    coerceUrl(url: URL): void;
}

/**
 *
 */
export const IAmbientRouteValuesObserver = AppServiceId<IAmbientRouteValuesObserver>("IAmbientRouteValuesObserver");
export interface IAmbientRouteValuesObserver {
    onDidAmbientValuesChange(): void;
}
