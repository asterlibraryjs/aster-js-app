import { assert } from "chai";
import { AppServiceId } from "./app-service-id";

describe("AppServiceId", () => {

    it("Should register a service using app namespace", () => {
        const serviceId = AppServiceId("my-service");

        assert.equal(serviceId.toString(), "@aster-js/app/my-service");
    });
})
