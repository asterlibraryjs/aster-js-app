import { assert } from "chai";
import { Route, RouteResolutionContext } from "../src";
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
        const ctx = RouteResolutionContext.create("items/robots/set/field/title/55".split("/"), false);

        const [path, values] = route.getRouteValues(ctx);

        assert.equal(path, "/items/robots/set/field/title/55/");
        assert.deepEqual(values, { item: "robots", mode: "set", field: "title", id: 55 });
    });

    it("Should get all route values", () => {
        const route1 = parse("/items/:item/:mode<get|set>");
        const route2 = parse("/items/:item/:mode");
        const ctx = RouteResolutionContext.create("items/robots/bob".split("/"), false);

        assert.isFalse(route1.match(ctx));
        assert.isTrue(route2.match(ctx));
    });

    it("Should match a single value with a default", () => {
        const route = parse("/:part?index");
        const ctx = RouteResolutionContext.create(["context.html"], false);

        assert.isTrue(route.match(ctx));
    });

    it("Should match a empty route with default", () => {
        const route = parse("/:part?index");
        const ctx = RouteResolutionContext.create([], false);

        assert.isTrue(route.match(ctx));
    });

    it("Should read a wildcarded route", () => {
        const route = parse("/items/:item/field/*");

        assert.isTrue(route.wildcard, "Is wildcard");
        assert.isFalse(route.relative, "Is relative");

        const ctx = RouteResolutionContext.create(["items", "robots", "field", "title", "55"], false);

        const match = route.match(ctx);

        assert.isTrue(match, "Is match");

        const [, values] = route.getRouteValues(ctx);

        assert.deepEqual({ item: "robots" }, values);
    });

    it("Should read a relative route", () => {
        const route = parse("~/:item?robots");

        assert.isFalse(route.wildcard, "Is wildcard");
        assert.isTrue(route.relative, "Is relative");

        const ctx = RouteResolutionContext.create([], true);

        const match = route.match(ctx);

        assert.isTrue(match, "Is match");

        const [, values] = route.getRouteValues(ctx);

        assert.deepEqual({ item: "robots" }, values);
    });

    it("Should read a relative route with boolean and regex", () => {
        const route = parse("~/:name<^bob[0-9]?$>/:!love<yeah|boo>");

        assert.isFalse(route.wildcard, "Is wildcard");
        assert.isTrue(route.relative, "Is relative");

        const ctx = RouteResolutionContext.create(["bob6", "boo"], true);

        const match = route.match(ctx);

        assert.isTrue(match, "Is match");

        const [, values] = route.getRouteValues(ctx);

        assert.deepEqual({ name:"bob6", love: false }, values);
    });
});
