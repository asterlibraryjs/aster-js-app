import { assert } from "chai";
import { SearchValues } from "./search-values";

describe("SearchValues", () => {

    type SearchValuesTestSuite = ReadonlyArray<{ readonly left: SearchValues, readonly right: SearchValues }>;

    ([
        { left: {}, right: {} },
        { left: { id: [] }, right: { id: [] } },
        { left: { id: "1" }, right: { id: "1" } },
        { left: { id: ["1"] }, right: { id: ["1"] } },
        { left: { id: ["1", "bob"] }, right: { id: ["1", "bob"] } },
        { left: { id: ["1", "bob"] }, right: { id: ["bob", "1"] } },
        { left: { id: ["1", "bob"], name: "dude" }, right: { name: "dude", id: ["bob", "1"] } },
    ] as SearchValuesTestSuite)
        .forEach(({ left, right }) => {
            it(`Should be equals to ${JSON.stringify(left)}`, () => {
                const result = SearchValues.areEquals(left, right);

                assert.isTrue(result);
            });
        });

    ([
        { left: { id: "1" }, right: {} },
        { left: { id: ["1"] }, right: { id: "1" } },
        { left: { id: "1" }, right: { id: "1", name: "bob" } },
    ] as SearchValuesTestSuite)
        .forEach(({ left, right }) => {
            it(`Should not be equals to ${JSON.stringify(left)}`, () => {
                const result = SearchValues.areEquals(left, right);

                assert.isFalse(result);
            });
        });

    it("Should stringify a SearchValues bag", () => {
        const values: SearchValues = {
            name: "bob",
            id: ["01", "22"],
            component: undefined
        };

        const result = SearchValues.stringify(values, true);

        assert.equal(result, "id=01&id=22&name=bob");
    });
})
