import { assert } from "chai";
import { IApplicationPartLifecycle, ApplicationPartLifecycleHooks, SinglePageApplication } from "../src";
import { IClock, IIoCModule, ILogger, resolveServiceId } from "@aster-js/ioc";
import { IDisposable } from "@aster-js/core";
import { spy, assert as sassert } from "sinon";
import { Query } from "@aster-js/iterators/lib/query"

describe("SinglePageApplication", () => {

    function assertKernelServices({ services }: IIoCModule) {
        // Logger
        const logger = services.get(ILogger);
        assert.isDefined(logger);

        // Logger and dependencies are working as expected
        const errorSpy = spy(console, "error");
        try {
            logger?.critical(null, "hey");
            sassert.calledOnce(errorSpy);
        }
        finally {
            errorSpy.restore();
        }

        // Clock
        const clock = services.get(IClock);
        assert.isDefined(clock);

        // Test that Clock is working as expected
        const nowSpy = spy(Date, "now");
        try {
            const now = clock?.utcNow();
            sassert.calledOnce(nowSpy);
        }
        finally {
            nowSpy.restore();
        }
    }

    it("Should create an empty application", () => {
        const app = SinglePageApplication.create("test").build();

        assert.isFalse(app.running, "Application not started");
        assertKernelServices(app);
    });

    it("Should start a new app", async () => {
        const app = await SinglePageApplication.start("test", () => { });
        assert.isTrue(app.running, "Application started");

        assertKernelServices(app);
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

        assert.isTrue(service.initialized, "Initialized called");
        assertKernelServices(app);
    });

    it("Should call lifecycle hooks at start", async () => {
        class Service implements IApplicationPartLifecycle {
            initialized: boolean = false;

            [ApplicationPartLifecycleHooks.setup](): Promise<void> {
                this.initialized = true;
                return Promise.resolve();
            }
        }
        const app = await SinglePageApplication.start("test", x => x.configure(x => x.addSingleton(Service)));

        const id = resolveServiceId(Service);
        const service = app.services.get(id, true);

        assert.isTrue(service.initialized, "Initialized called");
        assertKernelServices(app);
    });

    it("Should load and unload app properly", async () => {
        class Service implements IDisposable {
            state: string = "none";
            [Symbol.dispose]() {
                this.state = "disposed";
            }
        }

        const app = await SinglePageApplication.start("LoadTest", x =>
            x.addPart("/:app?index", x =>
                x.configure(x => x.addSingleton(Service))
                    .setup(Service, x => x.state = "initialized")
            )
        );

        const firstApp = app.activeChild!;
        assert.isDefined(firstApp);

        const svc = firstApp.services.get(resolveServiceId(Service), true);
        assert.equal(svc.state, "initialized");

        //IDisposable.safeDispose(firstApp);
        //assert.isUndefined(app.activeChild);
    });

});
