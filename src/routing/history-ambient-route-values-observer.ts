import { ServiceContract } from "@aster-js/ioc";
import { IAmbientRouteValues, IAmbientRouteValuesObserver } from "./abstraction/iambient-route-values";

@ServiceContract(IAmbientRouteValuesObserver)
export class HistoryAmbientRouteValuesObserver implements IAmbientRouteValuesObserver {

    constructor(
        private readonly _location: Location,
        private readonly _history: History,
        @IAmbientRouteValues private readonly _ambientRouteValues: IAmbientRouteValues
    ) {
    }

    onDidAmbientValuesChange(): void {
        const url = new URL(this._location.href);
        this._ambientRouteValues.coerceUrl(url);
        this._history.replaceState({}, "", url);
    }
}
