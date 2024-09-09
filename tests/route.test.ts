import { assert } from "chai";
import { Route, RouteResolutionCursor } from "../src";
import { assertStaticSegment, assertValueSegment } from "./route-asserts";
import { DefaultRouteParser } from "../src/routing/default-route-parser";
import { DefaultUrlValueValidatorFactory } from "../src/routing/url-value-validator/default-url-value-validator-factory";
import { DefaultUrlValueConverterFactory } from "../src/routing/url-value-converter/default-url-value-converter-factory";

describe("Route", () => {

    const converters = new DefaultUrlValueConverterFactory();
    const validators = new DefaultUrlValueValidatorFactory();
    const parser = new DefaultRouteParser(converters, validators);

    function parse(path: string) {
        const segments = parser.parse(path);
        return new Route(segments);
    }

    it("Should parse a single static segment", () => {
        const segments = [...parser.parse("/bob")];


        assert.equal(1, segments.length);

        const segment = segments[0];
        assertStaticSegment(segment, "bob");

        assert.isTrue(segment.match("bob"));
    });


    it("Should parse a single dynamic string segment", () => {
        const segments = [...parser.parse("/:bob")];

        assert.equal(1, segments.length);

        const segment = segments[0];
        assertValueSegment(segment, "bob", false);

        assert.isTrue(segment.match("hello"));
        assert.isFalse(segment.match(undefined));
    });

    it("Should parse a single dynamic enum segment", () => {
        const segments = [...parser.parse("/:bob<yellow|blue>")];

        assert.equal(1, segments.length);

        const segment = segments[0];
        assertValueSegment(segment, "bob", false);

        assert.isTrue(segment.match("yellow"));
        assert.isFalse(segment.match("red"));
    });

    it("Should parse a single dynamic enum segment with default value", () => {
        const segments = [...parser.parse("/:bob<yellow|blue>?transparent")];

        assert.equal(1, segments.length);

        const segment = segments[0];
        assertValueSegment(segment, "bob", true, "transparent");

        assert.isTrue(segment.match("yellow"), "1");
        assert.isTrue(segment.match(undefined), "2");
        assert.isFalse(segment.match("transparent"), "3");
    });

    it("Should parse a single dynamic string optional segment", () => {
        const segments = [...parser.parse("/:bob?")];

        assert.equal(1, segments.length);

        const segment = segments[0];
        assertValueSegment(segment, "bob", true, null);

        assert.isTrue(segment.match("hello"));
        assert.isTrue(segment.match(undefined));
    });

    it("Should parse a single dynamic string optional segment", () => {
        const segments = [...parser.parse("/:bob?ette")];

        assert.equal(1, segments.length);

        const segment = segments[0];
        assertValueSegment(segment, "bob", true, "ette");

        assert.isTrue(segment.match("hello"));
        assert.isTrue(segment.match(undefined));
    });

    it("Should parse a single dynamic number optional segment", () => {
        const segments = [...parser.parse("/:+bob?3")];

        assert.equal(1, segments.length);

        const segment = segments[0];
        assertValueSegment(segment, "bob", true, 3);

        assert.isFalse(segment.match("hello"));
        assert.isTrue(segment.match("52.3"));
        assert.isTrue(segment.match(undefined));
    });

    it("Should parse a single dynamic number optional segment", () => {
        const segments = [...parser.parse("/:+bob<2..55>?3")];

        assert.equal(1, segments.length);

        const segment = segments[0];
        assertValueSegment(segment, "bob", true, 3);

        assert.isFalse(segment.match("56"));
        assert.isTrue(segment.match("52.3"));
        assert.isTrue(segment.match(undefined));
    });

    it("Should parse a single dynamic boolean optional segment", () => {
        const segments = [...parser.parse("/:!bob<jackie|boby>?jackie")];

        assert.equal(1, segments.length);

        const segment = segments[0];
        assertValueSegment(segment, "bob", true, true);

        assert.isFalse(segment.match("true"));
        assert.isTrue(segment.match("jackie"));
        assert.isTrue(segment.match("boby"));
        assert.isTrue(segment.match(undefined));
    });

    it("Should parse a single dynamic regex segment", () => {
        const segments = [...parser.parse("/:bob<^name-[\\w]*$>")];

        assert.equal(1, segments.length);

        const segment = segments[0];
        assertValueSegment(segment, "bob", false, null);

        assert.isFalse(segment.match("true"));
        assert.isTrue(segment.match("name-0alpha9"), "name-0alpha9");
        assert.isFalse(segment.match("boby"));
    });

    it("Should parse a complex route", () => {
        const segments = [...parser.parse("/items/:item/field/:field?description/:!required<yes|no>?yes/:+id?")];

        assert.equal(6, segments.length);

        assertStaticSegment(segments[0], "items");
        assertValueSegment(segments[1], "item", false);
        assertStaticSegment(segments[2], "field");
        assertValueSegment(segments[3], "field", true, "description");
        assertValueSegment(segments[4], "required", true, true);
        assertValueSegment(segments[5], "id", true, null)
    });

    it("Should get all route values", () => {
        const route = parse("/items/:item/:mode<get|set>/field/:field?description/:+id?");
        const ctx = RouteResolutionCursor.read("items/robots/set/field/title/55");

        const values = route.getRouteValues(ctx);

        assert.deepEqual(values, { item: "robots", mode: "set", field: "title", id: 55 });
    });

    it("Should get all route values", () => {
        const route1 = parse("/items/:item/:mode<get|set>");
        const route2 = parse("/items/:item/:mode");
        const ctx = RouteResolutionCursor.read("items/robots/bob");

        assert.isFalse(route1.match(ctx));
        assert.isTrue(route2.match(ctx));
    });

    it("Should match a single value with a default", () => {
        const route = parse("/:part?index");
        const ctx = RouteResolutionCursor.read("context.html");

        assert.isTrue(route.match(ctx));
    });

    it("Should match a empty route with default", () => {
        const route = parse("/:part?index");
        const ctx = RouteResolutionCursor.read("/");

        assert.isTrue(route.match(ctx));
    });

    ([
        { routePath: "~/:name<^bob[0-9]?$>/:!love<yeah|boo>", relative: true, wildcard: false, path: "!/bob6/boo", values: { name: "bob6", love: false } },
        { routePath: "~/:item?robots", relative: true, wildcard: false, path: "!/", values: { item: "robots" } },
        { routePath: "/items/:item/field/*", relative: false, wildcard: true, path: "items/robots/field/title/55", values: { item: "robots" } },
        { routePath: "/items/:item/:field<name|title|id>", relative: false, wildcard: false, path: "items/robots/title", values: { item: "robots", field: "title" } },
        { routePath: "/items/:item/:+field<22..33>", relative: false, wildcard: false, path: "items/robots/22", values: { item: "robots", field: 22 } },
        { routePath: "/items/:item/:+field<22..>", relative: false, wildcard: false, path: "items/robots/5666684112", values: { item: "robots", field: 5666684112 } },
        { routePath: "/items/:item/:+field<..33>", relative: false, wildcard: false, path: "items/robots/-555522", values: { item: "robots", field: -555522 } },
        { routePath: "/items/:item/:+field<22.5..33.3>", relative: false, wildcard: false, path: "items/robots/22.6", values: { item: "robots", field: 22.6 } },
        { routePath: "/items/:item/", relative: false, wildcard: false, path: "/items/robot%20de%20l'espace", values: { item: "robot de l'espace" } },
        { routePath: "~/:field?id/*", relative: true, wildcard: true, path: "!/", values: { field: "id" } },
    ] as const)
        .forEach(({ routePath, relative, wildcard, path, values }) => {
            it(`Should match a route ${routePath}`, () => {
                const route = parse(routePath);

                assert.equal(route.relative, relative, "Is relative");
                assert.equal(route.wildcard, wildcard, "Is wildcard");

                const ctx = RouteResolutionCursor.read(path, { relativeIndicator: "!" });

                const isMatch = route.match(ctx);

                assert.isTrue(isMatch, "Match route is true");

                const routeValues = route.getRouteValues(ctx);

                assert.deepEqual(values, routeValues, `Values not equal \r${JSON.stringify(values)} !== ${JSON.stringify(routeValues)}`);
            });
        });
});
