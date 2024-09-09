import { assert } from "chai";
import { WildcardRouteSegment } from "./wildcard-route-segment";
import { RouteResolutionCursor } from "../route-resolution-cusor";

describe("WildcardRouteSegment", () => {

    it("Should match the wildcard symbol", () => {
        assert.isTrue(WildcardRouteSegment.instance.match("*"), "Should match the wildcard symbol");
    });

    it("Should not match empty string", () => {
        assert.isFalse(WildcardRouteSegment.instance.match(""), "Should not match empty string");
    });

    it("Should read a segment", () => {
        const cursor = new RouteResolutionCursor(["*"], false);

         WildcardRouteSegment.instance.read(cursor, {});

        assert.equal(cursor.remaining, 0, "Cursor should be empty after consuming the segment");
        assert.equal(cursor.sourcePath, "/*/", "Source should not change after consuming the cursor");
        assert.deepEqual(cursor.remainingPath, "/", "Path should be empty after consuming the cursor");
    });
})
