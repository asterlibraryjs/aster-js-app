import { assert } from "chai";
import { RouteData } from "./route-data";
import { Route } from "../route";

describe("RouteData", () => {

    it("Should create a new RouteData record", () => {
        const searchValues = { name: "bob" };
        const data = RouteData.create(Route.empty,{ id: "1", name: "jose" }, { id: "2" }, searchValues);

        assert.equal(data.query, searchValues);
        assert.deepEqual(data.values, { id: "2", name: "jose" });
    });

});
