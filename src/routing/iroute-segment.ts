import { RouteResolutionContext } from "./route-resolution-context";
import { RoutingConstants } from "./routing-constants";
import { RouteValues } from "./routing-invocation-context";

export interface IRouteSegment {
    match(segment: string | undefined): boolean;
    read(ctx: RouteResolutionContext, values: RouteValues): string | null;
    resolve(values: RouteValues, consume?: boolean): string | null;
}

function shiftOrThrow(ctx: RouteResolutionContext, value: string): void {
    const current = ctx.getAt(0);
    if (current !== value) {
        throw new Error(`Invalid token: expected segment equal to "${value}" but current segment is equal to "${current}"`);
    }
    ctx.shift();
}

export class StaticRouteSegment implements IRouteSegment {

    get segment(): string { return this._segment; }

    constructor(
        private readonly _segment: string
    ) { }

    match(segment: string | undefined): boolean {
        return segment === this._segment;
    }

    read(ctx: RouteResolutionContext, values: RouteValues): string | null {
        shiftOrThrow(ctx, this._segment);
        return this._segment;
    }

    resolve(values: RouteValues, consume?: boolean): string | null {
        return this._segment;
    }
}

export class WildcardRouteSegment implements IRouteSegment {
    static readonly instance = new WildcardRouteSegment();

    private constructor() { }

    match(segment: string | undefined): boolean { return true; }

    read(ctx: RouteResolutionContext, values: RouteValues): string | null {
        shiftOrThrow(ctx, RoutingConstants.WILDCARD_CHAR);
        return null;
    }

    resolve(values: RouteValues, consume?: boolean): string | null {
        return null;
    }
}

export class RelativeRouteSegment implements IRouteSegment {
    static readonly instance = new RelativeRouteSegment();

    private constructor() { }

    match(segment: string | undefined): boolean { return true; }

    read(ctx: RouteResolutionContext, values: RouteValues): string | null{
        shiftOrThrow(ctx, RoutingConstants.RELATIVE_CHAR);
        return null;
    }

    resolve(values: RouteValues, consume?: boolean): string | null {
        return null;
    }
}

export class StringRouteSegment implements IRouteSegment {

    get name(): string { return this._name; }

    get optional(): boolean { return this._optional; }

    get defaultValue(): string | null { return this._defaultValue; }

    constructor(
        private readonly _name: string,
        private readonly _optional: boolean,
        private readonly _defaultValue: string | null
    ) { }

    match(segment: string | undefined): boolean {
        if (typeof segment === "undefined") {
            return this._optional;
        }
        return true;
    }

    read(ctx: RouteResolutionContext, values: RouteValues): string | null {
        const value = ctx.shift() || this._defaultValue;
        if (value) this.loadValue(this._name, value, values);
        return value;
    }

    protected loadValue(name: string, value: string, values: RouteValues): void {
        values[name] = value;
    }

    resolve(values: RouteValues, consume?: boolean): string | null {
        if (Reflect.has(values, this._name)) {
            const value = values[this._name];
            if (consume) delete values[this._name];
            return String(value);
        }

        if (!this._optional || this._defaultValue === null)
            throw new Error(`Missing value for route value "${this._name}"`);

        return this._defaultValue;
    }
}

export class EnumRouteSegment extends StringRouteSegment {

    constructor(
        name: string,
        private readonly _enums: string[],
        optional: boolean,
        defaultValue: string | null
    ) {
        super(name, optional, defaultValue);
    }

    match(segment: string | undefined): boolean {
        if (typeof segment === "undefined") {
            return this.optional;
        }
        return this._enums.indexOf(segment) !== -1;
    }
}

export class NumberRouteSegment extends StringRouteSegment {

    match(segment: string | undefined): boolean {
        if (typeof segment === "undefined") {
            return this.optional;
        }
        return !isNaN(+segment);
    }

    protected loadValue(name: string, value: string, values: RouteValues): void {
        values[name] = +value;
    }
}
