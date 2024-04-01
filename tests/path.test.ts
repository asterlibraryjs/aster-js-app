import { assert } from "chai";
import { Path, PathParsingOptions } from "../src/routing/path";

describe("Path", () => {
    const cases = [
        { segments: ["/foo", "bar", "baz/asdf", "quux", ".."], expected: "/foo/bar/baz/asdf/quux/../" },
        { segments: ["foo", "bar", "/baz/asdf", "quux/", ".."], expected: "/foo/bar/baz/asdf/quux/../" },
        { segments: ["foo", "/bar/", "baz/asdf", "/quux/", ".."], expected: "/foo/bar/baz/asdf/quux/../" }
    ] as const;

    for (const { segments, expected } of cases) {
        it(`should join "${segments.join('", "')}"`, () => {
            const result = Path.join(segments);
            assert.equal(result, expected);
        });
    }

    (
        [
            { path: "./hello/world", options: { }, relative: true, expected: ["hello", "world"] },
            { path: "~/hello/world", options: { relativeIndicator: "~" }, relative: true, expected: ["hello", "world"] },
            { path: "/hello/world", options: { }, relative: false, expected: ["hello", "world"] },
            { path: "hello/world", options: { }, relative: false, expected: ["hello", "world"] },
            { path: "hello/world/", options: { }, relative: false, expected: ["hello", "world"] },
            { path: "hello/world//", options: { }, relative: false, expected: ["hello", "world"] },
            { path: "-hello-world-", options: { separator: "-" }, relative: false, expected: ["hello", "world"] },

        ] satisfies ReadonlyArray<{ path: string, options: PathParsingOptions, relative: boolean, expected: string[] }>
    )
        .forEach(({ path, options, relative, expected }, idx) => {
            it(`Should parse path ${path} #${idx}`, () => {
                const result = Path.parse(path, options);
                const segments = [...result];

                assert.equal(relative, result.relative);
                assert.deepEqual(segments, expected);
            });
        });
});
