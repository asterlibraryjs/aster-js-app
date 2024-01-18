import { assert } from "chai";
import { IRouter, SinglePageApplication } from "../src";

describe("DefaultRouter", () => {

    it("Should add default router", async () => {
        let called = false;
        const app = await SinglePageApplication.start("test", x => {
            x.addAction("/page/:name?index", (ctx) => {
                called = true;
                assert.equal("index", ctx.data.values["name"]);
                assert.equal("0", ctx.data.query["id"]);
            });
        });

        const router = app.services.get(IRouter, true);
        const result = router.eval("https://localhost/page?id=0", {});

        assert.instanceOf(result, Promise);

        await result;

        assert.isTrue(called);
    });

    it("Should create a child module and continue to load the route", async () => {
        let called = false;
        const app = await SinglePageApplication.start("test", x => {
            x.addAction("/page/:page/*", async (ctx) => {

                const pageName = ctx.data.values["page"];

                assert.equal("species", pageName);

                const builder = ctx.app.createChildScope(String(pageName));
                builder.addAction("~/view/:view", x => {
                    called = true;
                    assert.equal("species", ctx.data.values["page"]);
                    assert.equal("vertebrate", ctx.data.values["view"]);
                });

                await builder.build().start();
            });
        });

        const router = app.services.get(IRouter, true);
        const result = router.eval("https://localhost/page/species/view/vertebrate", {});

        assert.instanceOf(result, Promise);

        await result;

        assert.isTrue(called);
    });

});
