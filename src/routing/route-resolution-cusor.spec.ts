import { assert } from "chai";
import { RouteResolutionCursor } from "./route-resolution-cusor";

describe("RouteResolutionCursor", () => {

    it("Should ", () => {
        const cursor = new RouteResolutionCursor(["bob"], false);

        assert.isFalse(cursor.relative, "Should not be relative");
        assert.equal(cursor.remaining, 1, "Should have one segment remaining");
        assert.equal(cursor.sourcePath, "/bob/", "Should have the source path");
        assert.equal(cursor.remainingPath, "/bob/", "Should have the path");
        assert.equal(cursor.peek(), "bob", "Should peek the first segment");
    });

    it("Should shift", () => {
        const cursor = new RouteResolutionCursor(["bob"], true);

        assert.isTrue(cursor.relative, "Should be relative");
        assert.equal(cursor.shift(), "bob", "Should shift the first segment");
        assert.equal(cursor.remaining, 0, "Should have no segments remaining");
        assert.equal(cursor.sourcePath, "/bob/", "Should have the source path");
        assert.equal(cursor.remainingPath, "/", "Should have the path");
    });

    it("Should iterate", () => {
        const cursor = new RouteResolutionCursor(["bob", "the", "builder"], false);

        assert.deepEqual([...cursor], ["bob", "the", "builder"], "Should iterate over all segments");
    });

    it("Should read", () => {
        const cursor = RouteResolutionCursor.read("bob/the/builder");

        assert.equal(cursor.remaining, 3, "Should have three segments remaining");
        assert.equal(cursor.sourcePath, "/bob/the/builder/", "Should have the source path");
        assert.equal(cursor.remainingPath, "/bob/the/builder/", "Should have the path");
        assert.equal(cursor.peek(), "bob", "Should peek the first segment");
    });

    it("Should read relative", () => {
        const cursor = RouteResolutionCursor.read("./bob/the/builder", { relativeIndicator: "."});

        assert.isTrue(cursor.relative, "Should be relative");
        assert.equal(cursor.remaining, 3, "Should have three segments remaining");
        assert.equal(cursor.sourcePath, "/bob/the/builder/", "Should have the source path");
        assert.equal(cursor.remainingPath, "/bob/the/builder/", "Should have the path");
        assert.equal(cursor.peek(), "bob", "Should peek the first segment");
    });
})
