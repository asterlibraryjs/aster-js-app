import { assert } from "chai";
import {
    ApplicationPartSetup,
    SinglePageApplication,
    IApplicationPart,
    ApplicationPartLifecycleHooks,
    createApplicationPartLifecycleClassDecorator,
    ApplicationPartActivated
} from "../src";
import { ServiceContract, ServiceIdentifier } from "@aster-js/ioc";
import {IDisposable} from "@aster-js/core";

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
            active: boolean = false;

            @ApplicationPartActivated
            activated(app: IApplicationPart): unknown {
                this.active = true;
                return IDisposable.create(()=> this.active = false);
            }
        }

        const CustomServiceWithDisposableId = ServiceIdentifier.of(CustomServiceWithDisposable);

        using app = await SinglePageApplication.start("test", builder => {
            builder.addPart("/:part<moon>", _=>{ });
            builder.addPart("/:part<sun>?sun", b=> {
                b.configure(x => x.addSingleton(CustomServiceWithDisposableId, CustomServiceWithDisposable));
            });
        });

        assert.isDefined(app.activeChild, "Module sun must be activated");

        const svc = app.activeChild!.services.get(CustomServiceWithDisposableId, true);
        assert.isTrue(svc.active, "Active when activated");

        await app.navigate("/moon");

        assert.isFalse(svc.active, "Must be deactivated");
    });
});
