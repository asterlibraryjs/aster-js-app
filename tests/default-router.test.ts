import { assert } from "chai";
import { configure, IAppConfigureHandler, IApplicationPart, IApplicationPartBuilder, IRouter, SinglePageApplication } from "../src";
import { IRouteData, IContainerRouteData, SuccessRoutingResult } from "../src/routing/abstraction";

describe("DefaultRouter", () => {

    it("Should call default empty route", async () => {
        let called = false;
        using app = await SinglePageApplication.start("test", x => {
            x.addAction("/", (ctx) => {
                called = true;
            });
        });

        const router = app.services.get(IRouter, true);
        const result = await router.eval("https://localhost/", {});

        assert.isTrue(result.success, "started");
        assert.isTrue(called, "called");
    });

    it("Should add default router", async () => {
        let called = false;
        using app = await SinglePageApplication.start("test", x => {
            x.addAction("/page/:name?index", (ctx) => {
                called = true;
                assert.equal("index", ctx.data.values["name"]);
                assert.equal("0", ctx.data.query["id"]);
            });
        });

        const router = app.services.get(IRouter, true);
        const result = await router.eval("https://localhost/page?id=0", {});

        assert.isTrue(result.success, "started");
        assert.isTrue(called, "called");
    });

    it("Should create a child module and continue to load the route", async () => {
        let called = false;
        using app = await SinglePageApplication.start("test", x => {
            x.addPart("/page/:part/*", x => {
                x.addAction("~/view/:view", _ => { called = true; });
            });
        });

        const router = app.services.get(IRouter, true);
        const result = await router.eval("https://localhost/page/species/view/vertebrate", {});

        assert.isTrue(result.success, "started");
        assert.equal((<SuccessRoutingResult>result).relativeUrl, "/page/species/view/vertebrate/");
        assert.isTrue(called, "called");
    });

    it("Should load 2 nested application parts", async () => {
        let idCaptured = 0;
        using app = await SinglePageApplication.start("test", x => {
            x.addPart("/page/:part/*", x => {
                x.addPart("/view/:part/*", x => {
                    x.addAction("~/:+id", ({ data }) => { idCaptured = <number>data.values["id"]; });
                });
            });
        });

        const router = app.services.get(IRouter, true);
        const result = await router.eval("https://localhost/page/species/view/vertebrate/69", {});

        assert.isTrue(result.success, "started");
        assert.equal(idCaptured, 69);
    });

    it("Should create a child using configure handler and route data service", async () => {
        let called = false;

        class ViewConfigurationHandler implements IAppConfigureHandler {

            constructor(@IContainerRouteData private readonly _routeData: IRouteData) { }

            [configure](builder: IApplicationPartBuilder, host?: IApplicationPart | undefined): void {
                assert.equal(this._routeData.values["view"], "vertebrate");
                builder.addAction("~/", () => { called = true; })
            }
        }

        using app = await SinglePageApplication.start("test", x => x.addPart("/page/:part/view/:view/*", ViewConfigurationHandler));
        const router = app.services.get(IRouter, true);
        const result = await router.eval("https://localhost/page/species/view/vertebrate", {});

        assert.isTrue(result.success, "started");
        assert.equal((<SuccessRoutingResult>result).relativeUrl, "/page/species/view/vertebrate/");
        assert.isTrue(called, "called");
    });
});
