import type { RouteValue } from "../routing-invocation-context";
import { IUrlValueConverter } from "./iurl-value-converter";

export class UrlStringValueConverter implements IUrlValueConverter {
    canConvert(value: string): boolean {
        return true;
    }
    convert(value: string): RouteValue | null {
        return decodeURIComponent(value);
    }
    convertBack(value: any): string {
        return encodeURIComponent(value);
    }
}

export class UrlBooleanValueConverter implements IUrlValueConverter {
    private readonly _trueValue: string;
    private readonly _falseValue: string;

    constructor(trueValue: string, falseValue: string) {
        this._trueValue = encodeURIComponent(trueValue);
        this._falseValue = encodeURIComponent(falseValue);
    }
    canConvert(value: string): boolean {
        return this._trueValue === value || this._falseValue === value;
    }
    convert(value: string): RouteValue | null {
        return value === this._trueValue;
    }
    convertBack(value: RouteValue | null): string {
        return value ? this._trueValue : this._falseValue;
    }
}

export class UrlNumberValueConverter implements IUrlValueConverter {
    canConvert(value: string): boolean {
        return isNaN(+value) === false;
    }
    convert(value: string): RouteValue | null {
        return parseFloat(value);
    }
    convertBack(value: RouteValue | null): string {
        return String(value);
    }
}
