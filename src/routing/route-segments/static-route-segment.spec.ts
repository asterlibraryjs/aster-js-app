import { assert } from "chai";
import { StaticRouteSegment } from "./static-route-segment";
import { RouteResolutionCursor } from "../route-resolution-cusor";

describe("StaticRouteSegment", () => {

    it("Should match the wildcard symbol", () => {
        const segment = new StaticRouteSegment("bob");
        assert.isTrue(segment.match("bob"), "Should match the segment");
    });

    it("Should not match empty string", () => {
        const segment = new StaticRouteSegment("bob");
        assert.isFalse(segment.match(""), "Should not match empty string");
    });

    it("Should read a segment", () => {
        const segment = new StaticRouteSegment("bob");
        const cursor = new RouteResolutionCursor(["bob"], false);

        const read = segment.read(cursor, {});

        assert.equal(cursor.remaining, 0, "Cursor should be empty after consuming the segment");
        assert.equal(cursor.sourcePath, "/bob/", "Source should not change after consuming the cursor");
        assert.deepEqual(cursor.remainingPath, "/", "Path should be empty after consuming the cursor");
        assert.equal(read, "bob", "Result of the consumed path should be the segment");
    });
})
