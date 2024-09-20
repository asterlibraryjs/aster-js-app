import { assert } from "chai";
import { SinglePageApplication, ApplicationPartActivated, IApplicationPart, ApplicationPartDeactivated, ApplicationPartSetup } from "../src";
import { ServiceContract, ServiceIdentifier } from "@aster-js/ioc";

describe("Part Activations", () => {

    beforeEach(() => {
        history.replaceState({}, "", location.origin);
    });

    const ICustomService = ServiceIdentifier<CustomService>("CustomService");

    @ServiceContract(ICustomService)
    class CustomService {
        setupCount: number = 0;
        activateCount: number = 0;
        deactivateCount: number = 0;

        @ApplicationPartSetup
        load(_: IApplicationPart): Promise<void> {
            this.setupCount++;
            return Promise.resolve();
        }

        @ApplicationPartActivated
        activated(_: IApplicationPart): Promise<void> {
            this.activateCount++;
            return Promise.resolve();
        }

        @ApplicationPartDeactivated
        deactivated(_: IApplicationPart): Promise<void> {
            this.deactivateCount++;
            return Promise.resolve();
        }
    }

    function assertApp(app: IApplicationPart, expectedName: string, message?: string) {
        assert.isDefined(app, "app:" + message);
        assert.equal(app.name, expectedName, "app.name:" + message);
    }

    function assertServiceStates(svc: CustomService, setupCount: number, activateCount: number, deactivateCount: number, message?: string) {
        assert.equal(svc.setupCount, setupCount, "setupCount:" + message);
        assert.equal(svc.activateCount, activateCount, "activateCount:" + message);
        assert.equal(svc.deactivateCount, deactivateCount, "deactivateCount:" + message);
    }

    function assertAppStates(app: IApplicationPart, expectedName: string, setupCount: number, activateCount: number, deactivateCount: number, message?: string) {
        assertApp(app, expectedName, message);

        const childService = app.services.get(ICustomService)!;
        assert.isDefined(childService);
        assertServiceStates(childService, setupCount, activateCount, deactivateCount, message);

        return childService;
    }

    it("Should navigate through first level parts", async () => {

        using app = await SinglePageApplication.start("LoadTest", x => {
            x.addPart("/:part<moon>", x => x.configure(x => x.addSingleton(CustomService)));
            x.addPart("/:part<sun>?sun", x => x.configure(x => x.addSingleton(CustomService)));
        });

        const firstService = assertAppStates(app.activeChild!, "sun", 1, 1, 0);

        await app.navigate("/moon");

        assertServiceStates(firstService, 1, 1, 1);

        const secondService = assertAppStates(app.activeChild!, "moon", 1, 1, 0);
        assert.notEqual(firstService, secondService);

        await app.navigate("/sun");

        assertServiceStates(secondService, 1, 1, 1);

        const thirdService = assertAppStates(app.activeChild!, "sun", 1, 2, 1);
        assert.equal(firstService, thirdService);
    });

    it("Should reload a second level app properly", async () => {

        using app = await SinglePageApplication.start("LoadTest", x => {
            x.addPart("/:part<moon>/*", x => {
                x.addPart("~/:part?quarter", x => x.configure(x => x.addSingleton(CustomService)));
            });
            x.addPart("/:part<sun>?sun", x => { });
        });

        assertApp(app.activeChild!, "sun");

        await app.navigate("/moon/full");
        await app.navigate("/sun");
        await app.navigate("/moon/full");

        assertAppStates(app.activeChild?.activeChild!, "full", 1, 2, 1);
    });

    it("Should reload a second level app properly after a sibling", async () => {

        using app = await SinglePageApplication.start("LoadTest", x => {
            x.addPart("/:part<moon>/*", x => {
                x.addPart("~/:part?quarter", x => x.configure(x => x.addSingleton(CustomService)));
            });
            x.addPart("/:part<sun>?sun", x => { });
        });

        assertApp(app.activeChild!, "sun");

        await app.navigate("/moon/full");
        await app.navigate("/sun");
        await app.navigate("/moon/quarter");
        await app.navigate("/moon/full");

        assertAppStates(app.activeChild?.activeChild!, "full", 1, 2, 1);
    });

    it("Should reload a third level app properly after a sibling", async () => {

        using app = await SinglePageApplication.start("LoadTest", x => {
            x.addPart("/:part<moon>/*", x => {
                x.addPart("~/:part<new|waxing|quarter|waning|full>?full/*", x => {
                    x.addPart("~/:part<rise|set>?rise", x => x.configure(x => x.addSingleton(CustomService)));
                });
            });
            x.addPart("/:part<sun>?sun", x => { });
        });

        assertApp(app.activeChild!, "sun");

        await app.navigate("/moon/full/rise");

        const childService = assertAppStates(app.activeChild?.activeChild?.activeChild!, "rise", 1, 1, 0);

        await app.navigate("/sun");

        assertServiceStates(childService, 1, 1, 1);

        await app.navigate("/moon/quarter");
        await app.navigate("/moon/full/rise");

        assertAppStates(app.activeChild?.activeChild?.activeChild!, "rise", 1, 2, 1);
    });

    it("Should disable second level", async () => {

        using app = await SinglePageApplication.start("LoadTest", x => {
            x.addPart("/:part<moon>/*", x => {
                x.addPart("~/:part<new|waxing|quarter|waning|full>", x => x.configure(x => x.addSingleton(CustomService)));
            });
            x.addPart("/:part<sun>?sun", x => { });
        });

        assertApp(app.activeChild!, "sun");

        await app.navigate("/moon/full");

        const childService = assertAppStates(app.activeChild?.activeChild!, "full", 1, 1, 0);

        await app.navigate("/moon");

        assertServiceStates(childService, 1, 1, 1);
    });

    it("Should disable second level 2", async () => {

        using app = await SinglePageApplication.start("LoadTest", x => {
            x.addPart("/:part<moon>/*", x => {
                x.addPart("~/:part<new|waxing|quarter|waning|full>", x => x.configure(x => x.addSingleton(CustomService)));
                x.addAction("~/", _ => { });
            });
            x.addPart("/:part<sun>?sun", x => { });
        });

        assertApp(app.activeChild!, "sun");

        // Navigate to full moon
        await app.navigate("/moon/full");

        const childService = assertAppStates(app.activeChild?.activeChild!, "full", 1, 1, 0);

        // Navigate to full moon but with no part activation
        await app.navigate("/moon");

        assertServiceStates(childService, 1, 1, 1);
    });

    it("Should navigate back and forth", async () => {

        using app = await SinglePageApplication.start("LoadTest", x => {
            x.addPart("/:part<views>?views/*", x => {
                x.addPart("/:part<moon>/*", x => {
                    x.addPart("~/:part<new|waxing|quarter|waning|full>/:id", x => x.configure(x => x.addSingleton(CustomService)));
                    x.addAction("~/*", _ => { });
                });
                x.addPart("/:part<sun>?sun", x => { });
            });
        });

        assertApp(app.activeChild?.activeChild!, "sun", "Initial");

        await app.navigate("/views/moon/full/g25gde");

        const childService = assertAppStates(app.activeChild?.activeChild?.activeChild!, "full", 1, 1, 0, "First navigation");

        await app.navigate("/views/moon");

        assertServiceStates(childService, 1, 1, 1, "After second navigation");

        await app.navigate("/views/moon/full/g25gde");

        assertServiceStates(childService, 1, 2, 1, "After third navigation");

        await app.navigate("/views/moon/");

        assertServiceStates(childService, 1, 2, 2, "After fourth navigation");

        await app.navigate("/views/moon/full/fe41d");

        assertServiceStates(childService, 1, 3, 2, "After fift navigation");
    });

});
