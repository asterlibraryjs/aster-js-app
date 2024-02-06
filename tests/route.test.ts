import { assert } from "chai";
import { Route, RouteResolutionContext } from "../src";
import { assertEnumSegment, assertNumberSegment, assertStaticSegment, assertStringSegment } from "./route-asserts";

describe("Route", () => {

    it("Should parse a single static segment", () => {
        const route = Route.parse("/bob");

        const segments = [...route];

        assert.equal(1, segments.length);

        const segment = segments[0];
        assertStaticSegment(segment, "bob");

        assert.isTrue(segment.match("bob"));
    });


    it("Should parse a single dynamic string segment", () => {
        const route = Route.parse("/:bob");

        const segments = [...route];

        assert.equal(1, segments.length);

        const segment = segments[0];
        assertStringSegment(segment, "bob", false);

        assert.isTrue(segment.match("hello"));
        assert.isFalse(segment.match(undefined));
    });

    it("Should parse a single dynamic enum segment", () => {
        const route = Route.parse("/:bob<yellow|blue>");

        const segments = [...route];

        assert.equal(1, segments.length);

        const segment = segments[0];
        assertEnumSegment(segment, "bob", false);

        assert.isTrue(segment.match("yellow"));
        assert.isFalse(segment.match("red"));
    });

    it("Should parse a single dynamic enum segment with default value", () => {
        const route = Route.parse("/:bob<yellow|blue>?transparent");

        const segments = [...route];

        assert.equal(1, segments.length);

        const segment = segments[0];
        assertEnumSegment(segment, "bob", true, "transparent");

        assert.isTrue(segment.match("yellow"), "1");
        assert.isTrue(segment.match(undefined), "2");
        assert.isFalse(segment.match("transparent"), "3");
    });

    it("Should parse a single dynamic string optional segment", () => {
        const route = Route.parse("/:bob?");
        const segments = [...route];

        assert.equal(1, segments.length);

        const segment = segments[0];
        assertStringSegment(segment, "bob", true, null);

        assert.isTrue(segment.match("hello"));
        assert.isTrue(segment.match(undefined));
    });

    it("Should parse a single dynamic string optional segment", () => {
        const route = Route.parse("/:bob?ette");
        const segments = [...route];

        assert.equal(1, segments.length);

        const segment = segments[0];
        assertStringSegment(segment, "bob", true, "ette");

        assert.isTrue(segment.match("hello"));
        assert.isTrue(segment.match(undefined));
    });

    it("Should parse a single dynamic number optional segment", () => {
        const route = Route.parse("/:+bob?3");
        const segments = [...route];

        assert.equal(1, segments.length);

        const segment = segments[0];
        assertNumberSegment(segment, "bob", true, "3");

        assert.isFalse(segment.match("hello"));
        assert.isTrue(segment.match("52.3"));
        assert.isTrue(segment.match(undefined));
    });

    it("Should parse a complex route", () => {
        const route = Route.parse("/items/:item/field/:field?description/:+id?");
        const segments = [...route];

        assert.equal(5, segments.length);

        assertStaticSegment(segments[0], "items");
        assertStringSegment(segments[1], "item", false);
        assertStaticSegment(segments[2], "field");
        assertStringSegment(segments[3], "field", true, "description");
        assertNumberSegment(segments[4], "id", true, null);
    });

    it("Should get all route values", () => {
        const route = Route.parse("/items/:item/:mode<get|set>/field/:field?description/:+id?");
        const ctx = new RouteResolutionContext(null, "items/robots/set/field/title/55".split("/"));

        const [path, values] = route.getRouteValues(ctx);

        assert.equal(path, "items/robots/set/field/title/55");
        assert.deepEqual(values, { item: "robots", mode: "set", field: "title", id: 55 });
    });

    it("Should get all route values", () => {
        const route1 = Route.parse("/items/:item/:mode<get|set>");
        const route2 = Route.parse("/items/:item/:mode");
        const ctx = new RouteResolutionContext(null, "items/robots/bob".split("/"));

        assert.isFalse(route1.match(ctx));
        assert.isTrue(route2.match(ctx));
    });

    it("Should match a single value with a default", () => {
        const route = Route.parse("/:part?index");
        const ctx = new RouteResolutionContext(null, ["context.html"]);

        assert.isTrue(route.match(ctx));
    });

    it("Should read a wildcarded route", () => {
        const route = Route.parse("/items/:item/field/*");

        assert.isTrue(route.wildcard, "Is wildcard");
        assert.isFalse(route.relative, "Is relative");

        const ctx = new RouteResolutionContext(null, ["items", "robots", "field", "title", "55"]);

        const match = route.match(ctx);

        assert.isTrue(match, "Is match");

        const [,values] = route.getRouteValues(ctx);

        assert.deepEqual({ item: "robots" }, values);
    });
});
