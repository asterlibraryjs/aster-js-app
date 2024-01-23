import { assert } from "chai";
import { SinglePageApplication } from "../src";
import { resolveServiceId } from "@aster-js/ioc";
import { IDisposable } from "@aster-js/core";

describe("SinglePageApplication", () => {

    it("Should create an empty application", () => {
        const app = SinglePageApplication.create("test").build();

        assert.isFalse(app.running, "Application not started");
    });

    it("Should start a new app", async () => {
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
        const service = app.services.get(id, true);

        assert.isTrue(service.initialized, "initialized called");
    });

    it("Should load and unload app properly", async () => {
        class Service implements IDisposable {
            state: string = "none";
            [Symbol.dispose]() {
                this.state = "disposed";
            }
        }

        const app = await SinglePageApplication.start("test", x =>
            x.addPart("./:app?index", x =>
                x.configure(x => x.addSingleton(Service))
                    .setup(Service, x => x.state = "initialized")
            )
        );

        const defaultChild = app.getChild("index");
        assert.isDefined(defaultChild);
    });

});
