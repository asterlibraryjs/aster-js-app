import { assert } from "chai";
import { Route, RouteResolutionContext } from "../src";
import { assertNumberSegment, assertStaticSegment, assertStringSegment } from "./route-asserts";

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

    it("Should parse a single dynamic string optional segment", () => {
        const route = Route.parse("/:bob?");
        const segments = [...route];

        assert.equal(1, segments.length);

        const segment = segments[0];
        assertStringSegment(segment, "bob", true, "");

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
        assertNumberSegment(segments[4], "id", true, "");
    });

    it("Should reject relative url in non relative context", () => {
        const route = Route.parse("/items/:item/field/:field?description/:+id?");
        const ctx = new RouteResolutionContext(["items", "robots", "field","title","55"]);

        const values = route.getRouteValues(ctx);

        assert.deepEqual({ item: "robots", field: "title", id: 55 }, values);
    });

    it("Should read a wildcarded route", () => {
        const route = Route.parse("/items/:item/field/*");

        assert.isTrue(route.wildcard, "Is wildcard");
        assert.isFalse(route.relative, "Is relative");

        const ctx = new RouteResolutionContext(["items", "robots", "field","title","55"]);

        const match = route.match(ctx);

        assert.isTrue(match, "Is match");

        const values = route.getRouteValues(ctx);

        assert.deepEqual({ item: "robots" }, values);
    });
});
