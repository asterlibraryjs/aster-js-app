import { EnumArguments, RangeArguments, RegexArguments } from "../segment-arguments";
import { IUrlValueValidator } from "./iurl-value-validator";

export class UrlRangeValidator implements IUrlValueValidator {
    private readonly _min: number;
    private readonly _max: number;

    constructor([, rawMin, rawMax]: RangeArguments) {
        const min = parseFloat(rawMin);
        const max = parseFloat(rawMax);
        this._min = isNaN(min) ? Number.MIN_SAFE_INTEGER : min;
        this._max = isNaN(max) ? Number.MAX_SAFE_INTEGER : max;
    }

    validate(value: string): boolean {
        const num = parseFloat(value);
        return num >= this._min && num <= this._max;
    }

    toRouteString(): string{
        return `${this._min}..${this._max}`;
    }
}

export class UrlRegexValidator implements IUrlValueValidator {
    private readonly _regex: RegExp;

    constructor([, regex]: RegexArguments) {
        this._regex = new RegExp(regex);
    }

    validate(value: string): boolean {
        return this._regex.test(value);
    }

    toRouteString(): string{
        return this._regex.source;
    }
}

export class UrlEnumValidator implements IUrlValueValidator {
    private readonly _enumValues: Set<string>;

    constructor([, ...enumValues]: EnumArguments) {
        this._enumValues = new Set(enumValues);
    }

    validate(value: string): boolean {
        return this._enumValues.has(value);
    }

    toRouteString(): string{
        return Array.from(this._enumValues).join("!");
    }
}
