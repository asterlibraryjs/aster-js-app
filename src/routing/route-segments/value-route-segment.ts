import { cacheResult } from "@aster-js/decorators";
import { IRouteSegment } from "../abstraction/iroute-segment";
import { RouteResolutionCursor } from "../route-resolution-cusor";
import { RouteValue, RouteValues } from "../route-data";
import { IUrlValueConverter } from "../url-value-converter/iurl-value-converter";
import { IUrlValueValidator } from "../url-value-validator/iurl-value-validator";

export type RouteValueValidator = (value: string) => boolean;

export class ValueRouteSegment implements IRouteSegment {
    private _toStringCache?: string;

    get name(): string { return this._name; }

    get optional(): boolean { return this._optional; }

    get defaultValue(): RouteValue | null { return this._defaultValue; }

    @cacheResult()
    get defaultValueString(): string { return this._converter.convertBack(this._defaultValue); }

    constructor(
        private readonly _name: string,
        private readonly _optional: boolean,
        private readonly _defaultValue: RouteValue | null,
        private readonly _converter: IUrlValueConverter,
        private readonly _validator: IUrlValueValidator | null
    ) { }

    match(segment: string | undefined): boolean {
        if (typeof segment === "undefined") {
            return this._optional;
        }
        return this._converter.canConvert(segment) && (this._validator?.validate(segment) ?? true);
    }

    read(ctx: RouteResolutionCursor, values: RouteValues): string | null {
        const value = ctx.shift();
        if (typeof value !== "undefined" && value !== null) {
            values[this._name] = this._converter.convert(value);
            return String(value);
        }
        if (this._defaultValue !== null) {
            values[this._name] = this._defaultValue;
            return this.defaultValueString;
        }
        return null;
    }

    resolve(values: RouteValues, consume?: boolean): string | null {
        if (Reflect.has(values, this._name)) {
            const value = values[this._name];
            if (consume) delete values[this._name];
            return this._converter.convertBack(value);
        }

        if (!this._optional || this._defaultValue === null) {
            throw new Error(`Missing value for route value "${this._name}"`);
        }

        return this.defaultValueString;
    }

    toString(): string {
        if (!this._toStringCache) {
            const builder = [this._name];

            if (this._optional) builder.push("?");

            if (this._defaultValue !== null) builder.push(`:${this.defaultValueString}`);

            this._toStringCache = `{${builder.join("")}}`;
        }
        return this._toStringCache;
    }
}
