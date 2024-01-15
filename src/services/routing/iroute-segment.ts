import { RouteResolutionContext } from "./route-resolution-context";
import { RouteValues } from "./routing-invocation-context";

export interface IRouteSegment {
    isMatch(segment: string | undefined): boolean;
    loadValues(ctx: RouteResolutionContext, values: RouteValues): void;
}

const SEGMENT_SEPARATOR = "/";
const RELATIVE_CHAR = "~";
const WILDCARD_CHAR = "*";
const ASSIGN_CHAR = ":";
const NULLABLE_CHAR = "?";


export class Route {
    private readonly _segments: readonly IRouteSegment[];
    private readonly _wildcard?: true;
    private readonly _isRelative?: true;

    constructor(segments: Iterable<IRouteSegment>) {
        const array = [...segments];
        if (array[array.length - 1] === WildcardRouteSegment.instance) {
            array.pop();
            this._wildcard = true;
        }

        if (array[0] === RelativeRouteSegment.instance) {
            array.shift();
            this._isRelative = true;
        }
        this._segments = array;
    }

    isMatch(ctx: RouteResolutionContext): boolean {
        if (ctx.remaining > this._segments.length && !this._wildcard) return false;

        if (this._isRelative) {
            if (ctx.remaining === ctx.initialSize) return false;
        }

        for (let idx = 0; idx < this._segments.length; idx++) {
            const value = ctx.getAt(idx);
            if (!this._segments[idx].isMatch(value)) {
                return false;
            }
        }

        return true;
    }

    getRouteValues(ctx: RouteResolutionContext): RouteValues {
        const values: RouteValues = {};
        for (let i = 0; i < this._segments.length; i++) {
            this._segments[i].loadValues(ctx, values);
        }
        return values;
    }

    static parse(route: string): Route {
        const segments = Route.parseRoute(route);
        return new Route(segments);
    }

    private static * parseRoute(route: string): Iterable<IRouteSegment> {
        const segments = route.split(SEGMENT_SEPARATOR).filter(Boolean);
        if (segments[0] === RELATIVE_CHAR) {
            segments.shift();
            yield RelativeRouteSegment.instance;
        }
        for (let segment of segments) {
            if (segment === WILDCARD_CHAR) return WildcardRouteSegment.instance;

            if (segment.startsWith(ASSIGN_CHAR)) {
                // 2 segments when ever their is "?": ""
                const params = segment.substring(1).split(NULLABLE_CHAR);
                if (params.length == 2) {
                    yield this.createDynamicSegment(params[0], true, params[1]);
                }
                else {
                    yield this.createDynamicSegment(segment, false);
                }
            }
            else {

                yield new StaticRouteSegment(segment, false);
            }
        }
    }

    private static createDynamicSegment(name: string, optional: boolean, defaultValue?: string) {
        if (name.startsWith("+")) {
            return new NumberRouteSegment(name, optional, defaultValue);
        }
        return new StringRouteSegment(name, optional, defaultValue);
    }
}

export class StaticRouteSegment implements IRouteSegment {
    constructor(
        private readonly _segment: string,
        private readonly _optional: boolean
    ) { }

    isMatch(segment: string | undefined): boolean {
        if (typeof segment === "undefined") {
            return this._optional;
        }
        return segment === this._segment;
    }

    loadValues(ctx: RouteResolutionContext, values: RouteValues): void { }
}


export class WildcardRouteSegment implements IRouteSegment {
    static readonly instance = new WildcardRouteSegment();

    private constructor() { }

    isMatch(segment: string | undefined): boolean { return true; }

    loadValues(ctx: RouteResolutionContext, values: RouteValues): void { }
}

export class RelativeRouteSegment implements IRouteSegment {
    static readonly instance = new RelativeRouteSegment();

    private constructor() { }

    isMatch(segment: string | undefined): boolean { return true; }

    loadValues(ctx: RouteResolutionContext, values: RouteValues): void { }
}

export class StringRouteSegment implements IRouteSegment {
    constructor(
        private readonly _name: string,
        private readonly _optional: boolean,
        private readonly _defaultValue?: string
    ) {

    }

    isMatch(segment: string | undefined): boolean {
        if (typeof segment === "undefined") {
            return this._optional;
        }
        return true;
    }

    loadValues(ctx: RouteResolutionContext, values: RouteValues): void {
        const value = ctx.shift() ?? this._defaultValue;
        if (typeof value !== "undefined") {
            values[this._name] = value;
        }
    }
    protected loadValue(name: string, value: string, values: RouteValues): void {
        values[name] = value;
    }
}

export class NumberRouteSegment extends StringRouteSegment {
    protected loadValue(name: string, value: string, values: RouteValues): void {
        values[name] = +value;
    }
}
