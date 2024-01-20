import { assert } from "chai";
import { EnumRouteSegment, IRouteSegment, NumberRouteSegment, StaticRouteSegment, StringRouteSegment } from "../src";


export function assertStaticSegment(segment: IRouteSegment, expected: string): asserts segment is StaticRouteSegment {
    assert.instanceOf(segment, StaticRouteSegment);

    const staticRoute = <StaticRouteSegment>segment;
    assert.equal(expected, staticRoute.segment);
}

export function assertStringSegment(segment: IRouteSegment, expectedName: string, shouldBeOptional: boolean, expectedDefaultValue?: string): asserts segment is StringRouteSegment {
    assert.instanceOf(segment, StringRouteSegment);

    const staticRoute = <StringRouteSegment>segment;
    assert.equal(expectedName, staticRoute.name);
    assert.equal(shouldBeOptional, staticRoute.optional);
    assert.equal(expectedDefaultValue, staticRoute.defaultValue);
}

export function assertEnumSegment(segment: IRouteSegment, expectedName: string, shouldBeOptional: boolean, expectedDefaultValue?: string): asserts segment is StringRouteSegment {
    assert.instanceOf(segment, EnumRouteSegment);

    const staticRoute = <EnumRouteSegment>segment;
    assert.equal(expectedName, staticRoute.name);
    assert.equal(shouldBeOptional, staticRoute.optional);
    assert.equal(expectedDefaultValue, staticRoute.defaultValue);
}

export function assertNumberSegment(segment: IRouteSegment, expectedName: string, shouldBeOptional: boolean, expectedDefaultValue?: string): asserts segment is NumberRouteSegment {
    assert.instanceOf(segment, NumberRouteSegment);

    const staticRoute = <NumberRouteSegment>segment;
    assert.equal(expectedName, staticRoute.name);
    assert.equal(shouldBeOptional, staticRoute.optional);
    assert.equal(expectedDefaultValue, staticRoute.defaultValue);
}
