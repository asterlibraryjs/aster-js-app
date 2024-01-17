import { RouteResolutionContext } from "./route-resolution-context";
import { RELATIVE_CHAR, WILDCARD_CHAR } from "./routing-constants";
import { RouteValues } from "./routing-invocation-context";

export interface IRouteSegment {
    match(segment: string | undefined): boolean;
    read(ctx: RouteResolutionContext, values: RouteValues): void;
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

    read(ctx: RouteResolutionContext, values: RouteValues): void {
        shiftOrThrow(ctx, this._segment);
    }
}

export class WildcardRouteSegment implements IRouteSegment {
    static readonly instance = new WildcardRouteSegment();

    private constructor() { }

    match(segment: string | undefined): boolean { return true; }

    read(ctx: RouteResolutionContext, values: RouteValues): void {
        shiftOrThrow(ctx, WILDCARD_CHAR);
    }
}

export class RelativeRouteSegment implements IRouteSegment {
    static readonly instance = new RelativeRouteSegment();

    private constructor() { }

    match(segment: string | undefined): boolean { return true; }

    read(ctx: RouteResolutionContext, values: RouteValues): void {
        shiftOrThrow(ctx, RELATIVE_CHAR);
    }
}

export class StringRouteSegment implements IRouteSegment {

    get name(): string { return this._name; }

    get optional(): boolean { return this._optional; }

    get defaultValue(): string | undefined { return this._defaultValue; }

    constructor(
        private readonly _name: string,
        private readonly _optional: boolean,
        private readonly _defaultValue?: string
    ) {

    }

    match(segment: string | undefined): boolean {
        if (typeof segment === "undefined") {
            return this._optional;
        }
        return true;
    }

    read(ctx: RouteResolutionContext, values: RouteValues): void {
        const value = ctx.shift() ?? this._defaultValue;
        if (typeof value !== "undefined") {
            this.loadValue(this._name, value, values);
        }
    }

    protected loadValue(name: string, value: string, values: RouteValues): void {
        values[name] = value;
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
