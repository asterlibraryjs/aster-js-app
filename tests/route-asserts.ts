import { assert } from "chai";
import { IRouteSegment, RouteValue, StaticRouteSegment, ValueRouteSegment } from "../src";


export function assertStaticSegment(segment: IRouteSegment, expected: string): asserts segment is StaticRouteSegment {
    assert.instanceOf(segment, StaticRouteSegment);

    const staticRoute = <StaticRouteSegment>segment;
    assert.equal(expected, staticRoute.segment);
}

export function assertValueSegment(segment: IRouteSegment, expectedName: string, shouldBeOptional: boolean, expectedDefaultValue: RouteValue | null = null): asserts segment is ValueRouteSegment {
    assert.instanceOf(segment, ValueRouteSegment);

    const staticRoute = <ValueRouteSegment>segment;
    assert.equal(expectedName, staticRoute.name);
    assert.equal(shouldBeOptional, staticRoute.optional);
    assert.equal(expectedDefaultValue, staticRoute.defaultValue);
}
