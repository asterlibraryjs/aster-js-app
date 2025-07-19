import { assert } from "chai";
import {
    ApplicationPartActivated,
    ApplicationPartLifecycleHooks,
    ApplicationPartSetup,
    createApplicationPartLifecycleClassDecorator,
    IApplicationPart,
    SinglePageApplication
} from "../src";
import { ServiceContract, ServiceIdentifier } from "@aster-js/ioc";
import { IDisposable } from "@aster-js/core";

describe("NavigationService", () => {

    beforeEach(() => {
        history.replaceState({}, "", location.origin);
    });

    const customDecorator = createApplicationPartLifecycleClassDecorator<ICustomService>(ApplicationPartLifecycleHooks.setup,
        async function (this: ICustomService, app: IApplicationPart) {
            this.id = 55;
        });

    const ICustomService = ServiceIdentifier<CustomService>("ICustomService");
    type ICustomService = CustomService;

    @ServiceContract(ICustomService)
    @customDecorator
    class CustomService {

        id = 0;

        name = "CustomService";

        @ApplicationPartSetup
        async load(app: IApplicationPart): Promise<void> {
            this.name = app.name;
        }
    }

    it("Should call lifecycle hook from decorator", async () => {

        using app = await SinglePageApplication.start("test", builder => {
            builder.configure(x => x.addSingleton(CustomService));
        });

        await app.start();

        assert.equal(app.services.get(ICustomService, true).name, "test");
        assert.equal(app.services.get(ICustomService, true).id, 55);
    });

    it("Should call lifecycle hook from decorator and dispose activated stuff", async () => {

        class CustomServiceWithDisposable {
            state: "none" | "started" | "disposed" = "none";
            active: "none" | "activated" | "deactivated" | "disposed" = "none";

            @ApplicationPartSetup
            * setup(app: IApplicationPart): unknown {
                this.state = "started";
                yield IDisposable.create(() => this.state = "disposed");
                yield IDisposable.create(() => this.active = "disposed");
            }

            @ApplicationPartActivated
            activated(app: IApplicationPart): unknown {
                this.active = "activated";
                return IDisposable.create(() => this.active = "deactivated");
            }
        }

        const CustomServiceWithDisposableId = ServiceIdentifier.of(CustomServiceWithDisposable);

        using app = await SinglePageApplication.start("test", builder => {
            builder.addPart("/:part<moon>", _ => {
            });
            builder.addPart("/:part<sun>?sun", b => {
                b.configure(x => x.addSingleton(CustomServiceWithDisposableId, CustomServiceWithDisposable));
            });
        })

        assert.isDefined(app.activeChild, "Module sun must be activated");

        const svc = app.activeChild!.services.get(CustomServiceWithDisposableId, true);
        assert.equal(svc.active, "activated");
        assert.equal(svc.state, "started");

        await app.navigate("/moon");

        assert.equal(svc.active, "deactivated");

        IDisposable.safeDispose(app);

        assert.equal(svc.active, "disposed");
        assert.equal(svc.state, "disposed");
    });
});
