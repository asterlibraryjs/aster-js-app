import { assert } from "chai";
import { INavigationService, IRouter, SinglePageApplication } from "../src";

describe("NavigationService", () => {

    beforeEach(() => {
        history.replaceState({}, "", location.origin);
    });

    it("Should navigate and eval simple url", async () => {
        const expected = new URL("/test/", location.href).href;

        using app = await SinglePageApplication.start("test", builder => {
            builder.addAction("/:name?", () => { });
        });

        const svc = app.services.get(INavigationService, true);

        await svc.navigate("/test");

        assert.equal(location.href, expected);
    });

    it("Should navigate to a children part", async () => {
        const expected = new URL("/test/", location.href).href;

        using app = await SinglePageApplication.start("test", builder => {
            builder.addPart("/:part?home/*", x => {
                x.addAction("~/:view?", () => { });
            });
        });

        assert.isDefined(app.activeChild);

        const svc = app.activeChild!.services.get(INavigationService, true);

        await svc.navigate("/test");

        assert.equal(location.href, expected);
    });

    it("Should call a part action", async () => {
        let callCount = 0;
        const expected = new URL("/home/test/", location.href).href;

        using app = await SinglePageApplication.start("test", builder => {
            builder.addPart("/:part?home/*", x => {
                x.addAction("~/:view?", () => { callCount++; });
            });
        });

        assert.isDefined(app.activeChild);
        assert.equal(callCount, 1);

        const svc = app.activeChild!.services.get(INavigationService, true);

        await svc.navigate("~/test");

        assert.equal(location.href, expected);
        assert.equal(callCount, 2);
    });

    it("Should call a part action and change part", async () => {
        let callCount = 0;
        const expected = new URL("/home/test/", location.href).href;

        using app = await SinglePageApplication.start("test", builder => {
            builder.addPart("/:part?home/*", x => {
                x.addAction("~/:view?", IRouter, (svc: IRouter) => {
                    callCount++;
                });
            });
        });

        assert.isDefined(app.activeChild);
        assert.equal(callCount, 1);

        const svc = app.activeChild!.services.get(INavigationService, true);

        await svc.navigate("~/test");

        assert.equal(location.href, expected);
        assert.equal(callCount, 2);
    });

    it("Should call nested part", async () => {
        let callCount = 0;
        const expected = new URL( "/home/index/donot/", location.href).href;

        using app = await SinglePageApplication.start("test", builder => {
            builder.addPart("/:part?home/*", x => {
                x.addPart("~/:part?index", x => {
                    x.addAction("~/:action<do>?", IRouter, (svc: IRouter) => {
                        callCount++;
                    });
                    x.addAction("~/:action<donot>?", IRouter, (svc: IRouter) => {
                        callCount--;
                    });
                })
            });
        });

        assert.isDefined(app.activeChild);
        assert.isDefined(app.activeChild?.activeChild);
        assert.equal(callCount, 1);

        const svc = app.activeChild!.activeChild!.services.get(INavigationService, true);

        await svc.navigate("~/donot");

        assert.equal(location.href, expected);
        assert.equal(callCount, 0);
    });

    it("Should navigate properly between parts", async () => {
        let callCount = 0;

        using app = await SinglePageApplication.start("test", builder => {
            builder.addPart("/:part<home>?home/*", x => {
                x.addPart("/:part<index>?index", _ => { callCount++; });
                x.addPart("/:part<account>", _ => { callCount++; });
            });
            builder.addPart("/:part<admin>", _ => { });
        });

        assert.isDefined(app.activeChild);
        assert.isDefined(app.activeChild?.activeChild);
        assert.equal(callCount, 1);

        const svc = app.services.get(INavigationService, true);

        await svc.navigate("/admin");

        assert.isDefined(app.activeChild);
        assert.isUndefined(app.activeChild!.activeChild);
        assert.equal(callCount, 1);
    });

});
