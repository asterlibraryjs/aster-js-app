import { assert } from "chai";
import { UrlValues } from "./url-values";
import { SearchValues } from "./search-values";

describe("SearchValues", () => {

    type SearchValuesTestSuite = ReadonlyArray<{ readonly left: SearchValues, readonly right: SearchValues }>;

    ([
        { left: { }, right: { } },
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
})
