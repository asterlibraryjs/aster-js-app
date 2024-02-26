import { EnumArguments, RangeArguments, RegexArguments } from "../segment-arguments";
import { IUrlValueValidator } from "./iurl-value-validator";

export class UrlRangeValidator implements IUrlValueValidator {
    private readonly _min: number;
    private readonly _max: number;

    constructor([, min, max]: RangeArguments) {
        this._min = parseFloat(min);
        this._max = parseFloat(max);
    }
    validate(value: string): boolean {
        const number = parseFloat(value);
        return number >= this._min && number <= this._max;
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
}

export class UrlEnumValidator implements IUrlValueValidator {
    private readonly _enumValues: Set<string>;

    constructor([, ...enumValues]: EnumArguments) {
        this._enumValues = new Set(enumValues);
    }
    validate(value: string): boolean {
        return this._enumValues.has(value);
    }
}
