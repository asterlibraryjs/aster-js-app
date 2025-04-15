import { IApplicationPart } from "../abstraction/iapplication-part";
import { IAmbientRouteValues, IAmbientRouteValuesObserver } from "./abstraction/iambient-route-values";
import { SearchValues } from "./route-data";
import { ServiceContract } from "@aster-js/ioc";

@ServiceContract(IAmbientRouteValues)
export class AmbientRouteValues implements IAmbientRouteValues {
    private _values: SearchValues;

    get values(): SearchValues { return this._values; }

    constructor(@IApplicationPart private readonly _root: IApplicationPart) {
        this._values = SearchValues.empty;
    }

    coerceUrl(url: URL): void {
        const actual = SearchValues.parse(url.search);
        const newValues = { ...actual, ...this._values };
        url.search = SearchValues.toString(newValues);
    }

    setValues(values: SearchValues): void {
        this._values = structuredClone(values);

        const observers: IAmbientRouteValuesObserver[] = [];
        let part: IApplicationPart | undefined = this._root;
        while (part) {
            observers.push(
                ...part.services.getAll(IAmbientRouteValuesObserver)
            );
            part = part.activeChild;
        }
        for (const observer of observers) {
            observer.onDidAmbientValuesChange();
        }
    }
}
