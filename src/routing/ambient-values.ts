import { IApplicationPart } from "../abstraction/iapplication-part";
import { IAmbientValues, IAmbientRouteValuesObserver } from "./abstraction/iambient-values";
import { SearchValues } from "./route-data";
import { ServiceContract } from "@aster-js/ioc";

@ServiceContract(IAmbientValues)
export class AmbientValues implements IAmbientValues {
    private _values: SearchValues;

    get values(): SearchValues { return this._values; }

    constructor(@IApplicationPart private readonly _root: IApplicationPart) {
        this._values = SearchValues.empty;
    }

    coerceUrl(url: URL): void {
        const actual = SearchValues.parse(url.search);
        const newValues = { ...actual, ...this._values };

        url.search = SearchValues.stringify(newValues);
    }

    setValues(values: SearchValues): void {
        this._values = SearchValues.merge(this._values, values);

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
