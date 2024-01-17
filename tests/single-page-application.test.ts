import { assert } from "chai";
import { SinglePageApplication } from "../src";
import { resolveServiceId } from "@aster-js/ioc";

describe("SinglePageApplication", () => {

    it("Should create an empty application", () => {
        const app = new SinglePageApplication("test", class { configure() { } });

        assert.isFalse(app.running, "Application not started");
    });

    it("Should ", async () => {
        const app = await SinglePageApplication.start("test", () => { });
        assert.isTrue(app.running, "Application started");
    });

    it("Should register services and call proper setup", async () => {
        class Service {
            initialized: boolean = false;
        }
        const app = await SinglePageApplication.start("test", x => {
            x.configure(x => x.addSingleton(Service));
            x.setup(Service, x => x.initialized = true)
        });

        const id = resolveServiceId(Service);
        const service =  app.services.get(id, true);

        assert.isTrue(service.initialized, "initialized called");
    });

});
