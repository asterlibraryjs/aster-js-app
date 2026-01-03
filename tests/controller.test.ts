import { assert } from "chai";
import {
    Controller,
    ControllerRouteParam,
    FromRoute,
    FromSearch,
    FromUrl,
    htmlResult,
    IAmbientValues,
    IAppConfigureHandler,
    IApplicationPart,
    IRouter,
    IRoutingResult,
    RouteData,
    RoutePath,
    RouteValues,
    SearchValues,
    SinglePageApplication,
    UrlValues
} from "../src";
import { asserts } from "@aster-js/core";
import { sleep } from "@aster-js/async/lib/helpers";

describe("Controller", () => {

    it("Should use a controller to handle a route", async () => {
        const root = document.createElement("div");
        root.innerHTML = "<b>Loading...</b>"

        @Controller("/customer")
        class CustomerViewController {

            @RoutePath("/:+customerId/detail/:+id/:text")
            async showDetail(
                @FromRoute("text") text: string,
                @FromRoute("id") routeValueId: number,
                @FromSearch("id") queryId: string,
                @FromUrl("id") paramId: number | string,
                @FromRoute("customerId") customerRouteValueId: number,
                @FromSearch("customerId") customerQueryId: string,
                @FromUrl("customerId") customerParamId: number | string,
                @FromUrl("category") category: string,
                @FromRoute() allRouteValues: RouteValues,
                @FromSearch() allQuery: SearchValues,
                @FromUrl() allParams: UrlValues
            ): Promise<IRoutingResult> {

                assert.equal(routeValueId, 33, "routeValueId");
                assert.equal(queryId, "99", "queryId");
                assert.equal(paramId, "99", "paramId");

                assert.deepEqual(customerRouteValueId, 555, "customerRouteValueId");
                assert.deepEqual(customerQueryId, undefined, "customerQueryId");
                assert.deepEqual(customerParamId, 555, "customerParamId");
                assert.equal(category, "cool", "category");

                assert.deepEqual(allRouteValues, { id: 33, customerId: 555, text: "hello world" });
                assert.deepEqual(allQuery, { id: "99", filter: ["a", "b"], category: "cool" });
                assert.deepEqual(allParams, {
                    id: "99",
                    customerId: 555,
                    filter: ["a", "b"],
                    text: "hello world",
                    category: "cool"
                });

                return htmlResult(`<i>${text} ${routeValueId} !!</i>`, root);
            }
        }

        using app = await SinglePageApplication.start("bob", IAppConfigureHandler.create(builder => {
            builder.addController(CustomerViewController);
        }));

        const ambientValues = app.services.get(IAmbientValues, true);
        ambientValues.setValues({ "category": "cool" });

        await app.services.get(IRouter, true).eval("./customer/555/detail/33/hello%20world?id=99&filter=a&filter=b");

        assert.equal(root.innerHTML, "<div><i>hello world 33 !!</i></div>");
    });

    it("Should use custom decorator to inject value", async () => {
        const root = document.createElement("div");
        root.innerHTML = "<b>Loading...</b>"

        const AppName = <ParameterDecorator>function (target: object, propertyKey: string | symbol, index: number) {
            asserts.ofType(propertyKey, "string");

            const accessor = (_: RouteData, app: IApplicationPart) => app.name;

            ControllerRouteParam.add(target, propertyKey, index, accessor);
        };

        class CustomerViewController {

            @RoutePath("/customer/:+customerId")
            async showDetail(
                @AppName appName: string
            ): Promise<IRoutingResult> {
                assert.equal(appName, "bob", "appName");
                return htmlResult(`<h1>${appName}</h1>`, root);
            }
        }

        using app = await SinglePageApplication.start("bob", IAppConfigureHandler.create(builder => {
            builder.addController(CustomerViewController);
        }));

        await app.services.get(IRouter, true).eval("./customer/555");
        assert.equal(root.innerHTML, "<div><h1>bob</h1></div>");
    });

    it("Should use a controller nested in an application part to handle a route", async () => {
        const root = document.createElement("div");
        root.innerHTML = "<b>Loading...</b>";

        class CustomerViewController {

            constructor(@IApplicationPart private readonly _part: IApplicationPart) {
            }

            @RoutePath("~/detail/:+id")
            async showDetail(@FromRoute("id") id: number): Promise<IRoutingResult> {
                return htmlResult(`<i>Selected ID: ${id}</i>`, root);
            }

            @RoutePath("~/")
            async index(): Promise<IRoutingResult> {
                return this.showDetail(0);
            }
        }

        using app = await SinglePageApplication.start("bob", IAppConfigureHandler.create(builder => {
            builder.addPart("/:part<customer>/*", x => {
                x.addController(CustomerViewController);
            });
        }));

        await app.services.get(IRouter, true).eval("./customer/");
        assert.equal(root.innerHTML, "<div><i>Selected ID: 0</i></div>");

        await app.services.get(IRouter, true).eval("./customer/detail/55");
        assert.equal(root.innerHTML, "<div><i>Selected ID: 55</i></div>");
    });

    it("Should run an async iterator result", async () => {
        const header = document.createElement("div");
        header.innerHTML = "Page Title";
        const main = document.createElement("div");
        main.innerHTML = "<p>Loading...</p>";

        @Controller("/customers")
        class CustomerViewController {

            constructor(@IApplicationPart private readonly _part: IApplicationPart) {
            }

            @RoutePath("/:+id?0")
            async* index(@FromRoute("id") id: number): AsyncIterable<IRoutingResult> {
                yield  htmlResult(`Customer Home`, header);
                await sleep(1000);
                yield htmlResult(`<p>Welcome Home Customer #${id}</p>`, main);
            }

            @RoutePath("/:+id/details")
            * details(@FromRoute("id") id: number): Iterable<IRoutingResult> {
                yield htmlResult(`Customer details`, header);
                yield htmlResult(`<p>Details for customer #${id}</p>`, main);
            }
        }

        using app = await SinglePageApplication.start("bob", IAppConfigureHandler.create(builder => {
            builder.addController(CustomerViewController);
        }));

        await app.services.get(IRouter, true).eval("./customers/");
        assert.equal(header.innerHTML, "<div>Customer Home</div>");
        assert.equal(main.innerHTML, "<div><p>Welcome Home Customer #0</p></div>");

        await app.services.get(IRouter, true).eval("./customers/5/details");
        assert.equal(header.innerHTML, "<div>Customer details</div>");
        assert.equal(main.innerHTML, "<div><p>Details for customer #5</p></div>");
    });

});
