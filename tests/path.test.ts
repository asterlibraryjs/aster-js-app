import { assert } from "chai";
import { Path } from "../src/routing/path";

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

});
