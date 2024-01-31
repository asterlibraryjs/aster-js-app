import { assert } from "chai";
import { html, IAppConfigureHandler, IApplicationPart, IRouter, IRoutingResult, Param, ParamValues, Query, QueryValues, RouteData, RoutePath, RouteValue, RouteValues, SinglePageApplication } from "../src";

describe("Controller", () => {

    it("Should ", async () => {
        const root = document.createElement("div");
        root.innerHTML = "<b>Loading...</b>"

        class CustomerViewController {

            constructor(@IApplicationPart private readonly _part: IApplicationPart) { }

            @RoutePath("/customer/:+customerId/detail/:+id/:text")
            async showDetail(

                @RouteValue("text") text: string,

                @RouteValue("id") routeValueId: number,
                @Query("id") queryId: string,
                @Param("id") paramId: number | string,

                @RouteValue("customerId") customerRouteValueId: number,
                @Query("customerId") customerQueryId: string,
                @Param("customerId") customerParamId: number | string,

                @RouteValue() allRouteValues: RouteValues,
                @Query() allQuery: QueryValues,
                @Param() allParams: ParamValues

            ): Promise<IRoutingResult> {

                assert.equal(routeValueId, 33, "routeValueId");
                assert.equal(queryId, "99", "queryId");
                assert.equal(paramId, "99", "paramId");

                assert.deepEqual(customerRouteValueId, 555, "customerRouteValueId");
                assert.deepEqual(customerQueryId, undefined, "customerQueryId");
                assert.deepEqual(customerParamId, 555, "customerParamId");

                assert.deepEqual(allRouteValues, { id: 33, customerId: 555, text: "hello world" });
                assert.deepEqual(allQuery, { id: "99", filter: ["a", "b"] });
                assert.deepEqual(allParams, { id: "99", customerId: 555, filter: ["a", "b"], text: "hello world" });

                return html(`<i>${text} ${routeValueId} !!</i>`, root);
            }
        }

        const app = await SinglePageApplication.start("bob", IAppConfigureHandler.create(builder => {
            builder.addController(CustomerViewController);
        }));

        await app.services.get(IRouter, true).eval("./customer/555/detail/33/hello%20world?id=99&filter=a&filter=b");

        assert.equal(root.innerHTML, "<div><i>hello world 33 !!</i></div>");
    });

});
