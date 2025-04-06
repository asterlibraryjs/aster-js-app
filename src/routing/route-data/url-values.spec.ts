import { assert } from "chai";
import { UrlValues } from "./url-values";

describe("UrlValues", () => {

    it("Should create a new UrlValues record", () => {
        const values = UrlValues.create({ id: "1" }, { id: "2" }, { name: "ss"});

        assert.deepEqual(values, { id: "2", name: "ss" });
    });
})
