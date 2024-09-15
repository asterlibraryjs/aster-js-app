import { assert } from "chai";
import { UrlNumberValueConverter, UrlStringValueConverter } from "../url-value-converter/url-value-converters";
import { ValueRouteSegment } from "./value-route-segment";
import { UrlRangeValidator } from "../url-value-validator/url-value-validators";

describe("ValueRouteSegment", () => {

    it("Should create a new value route segment", () => {
        const routeValue = new ValueRouteSegment("val", true, "moon", new UrlStringValueConverter(), null);
        assert.equal( routeValue.toString(), ":val?moon");
    });

    it("Should create a new value route segment", () => {
        const routeValue = new ValueRouteSegment("val", true, "moon", new UrlNumberValueConverter(), new UrlRangeValidator(["range", "1", "10"]));
        assert.equal( routeValue.toString(), ":+val<1..10>?moon");
    });
})
