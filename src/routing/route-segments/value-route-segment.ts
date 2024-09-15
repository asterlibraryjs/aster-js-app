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

    read(ctx: RouteResolutionCursor, values: RouteValues): void {
        const value = ctx.shift();
        if (typeof value !== "undefined" && value !== null) {
            values[this._name] = this._converter.convert(value);
        }
        else if (this._defaultValue !== null) {
            values[this._name] = this._defaultValue;
        }
    }

    resolve(values: RouteValues, consume?: boolean): string | null {
        if (Reflect.has(values, this._name)) {
            const value = values[this._name];
            if (consume) delete values[this._name];
            return this._converter.convertBack(value);
        }

        if (!this._optional) {
            throw new Error(`Missing value for route value "${this._name}"`);
        }

        if (this._defaultValue === null) return null;

        return this.defaultValueString;
    }

    toString(): string {
        if (!this._toStringCache) {
            const builder = [":"];

            if (this._converter.targetType === "boolean") {
                builder.push("!");
            }
            else if (this._converter.targetType === "number") {
                builder.push("+");
            }

            builder.push(this._name);

            if (this._validator) {
                builder.push("<", this._validator.toRouteString(), ">");
            }

            if (this._optional) {
                if (this._defaultValue !== null) {
                    builder.push("?", this.defaultValueString);
                }
                else {
                    builder.push("?");
                }
            }
            this._toStringCache = `${builder.join("")}`;
        }
        return this._toStringCache;
    }
}
