import { ServiceContract } from "@aster-js/ioc";
import { IAmbientValues, IAmbientRouteValuesObserver } from "./abstraction/iambient-values";

@ServiceContract(IAmbientRouteValuesObserver)
export class HistoryAmbientRouteValuesObserver implements IAmbientRouteValuesObserver {

    constructor(
        private readonly _location: Location,
        private readonly _history: History,
        @IAmbientValues private readonly _ambientValues: IAmbientValues
    ) {
    }

    onDidAmbientValuesChange(): void {
        const url = new URL(this._location.href);
        this._ambientValues.coerceUrl(url);
        this._history.replaceState({}, "", url);
    }
}
