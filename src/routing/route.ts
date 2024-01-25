import { IRouteSegment, WildcardRouteSegment, RelativeRouteSegment, StaticRouteSegment, NumberRouteSegment, StringRouteSegment, EnumRouteSegment } from "./iroute-segment";
import { RouteResolutionContext } from "./route-resolution-context";
import { RouteValues } from "./routing-invocation-context";
import { ASSIGN_CHAR, NULLABLE_CHAR, SEGMENT_SEPARATOR, WILDCARD_CHAR, RELATIVE_CHAR } from "./routing-constants";

/** */
export class Route implements Iterable<IRouteSegment>{
    private readonly _segments: readonly IRouteSegment[];
    private readonly _wildcard?: true;
    private readonly _relative?: true;

    get wildcard(): boolean { return this._wildcard ?? false; }

    get relative(): boolean { return this._relative ?? false; }

    constructor(segments: Iterable<IRouteSegment>) {
        const array = [...segments];
        if (array[array.length - 1] === WildcardRouteSegment.instance) {
            array.pop();
            this._wildcard = true;
        }

        if (array[0] === RelativeRouteSegment.instance) {
            array.shift();
            this._relative = true;
        }
        this._segments = array;
    }

    match(ctx: RouteResolutionContext): boolean {
        if (!this._wildcard && ctx.remaining > this._segments.length) return false;
        if (this._relative && ctx.remaining === ctx.initialSize) return false;

        for (let idx = 0; idx < this._segments.length; idx++) {
            const value = ctx.getAt(idx);
            if (!this._segments[idx].match(value)) {
                return false;
            }
        }

        return true;
    }

    getRouteValues(ctx: RouteResolutionContext): RouteValues {
        const values: RouteValues = {};
        for (let i = 0; i < this._segments.length; i++) {
            this._segments[i].read(ctx, values);
        }
        return values;
    }

    *[Symbol.iterator](): IterableIterator<IRouteSegment> {
        yield* this._segments;
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
            if (segment === WILDCARD_CHAR) {
                yield WildcardRouteSegment.instance;
                break;
            }

            if (segment.startsWith(ASSIGN_CHAR)) {
                segment = segment.substring(1);
                // 2 segments when ever their is "?": ""
                const params = segment.split(NULLABLE_CHAR);
                if (params.length === 2) {
                    yield this.createDynamicSegment(params[0], true, params[1]);
                }
                else {
                    yield this.createDynamicSegment(segment, false);
                }
            }
            else {
                yield new StaticRouteSegment(segment);
            }
        }
    }
    // url/:value<enum|enum|enum>
    private static createDynamicSegment(name: string, optional: boolean, defaultValue?: string) {
        if (name.startsWith("+")) {
            return new NumberRouteSegment(name.substring(1), optional, defaultValue);
        }
        const idx = name.indexOf("<");
        if (idx !== -1 && name.endsWith(">")) {
            const values = name.substring(idx + 1, name.length - 2).split("|");
            name = name.substring(0, idx);
            return new EnumRouteSegment(name, values, optional, defaultValue);
        }
        return new StringRouteSegment(name, optional, defaultValue);
    }
}
