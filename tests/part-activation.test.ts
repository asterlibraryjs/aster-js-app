import { assert } from "chai";
import { ApplicationPartLifecycleHooks, SinglePageApplication, ApplicationPartActivated, IApplicationPart, IContainerRouteData, ApplicationPartDeactivated, ApplicationPartSetup } from "../src";
import { resolveServiceId, ServiceContract, ServiceIdentifier } from "@aster-js/ioc";
import { IDisposable } from "@aster-js/core";

describe("SinglePageApplication", () => {

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

    it("Should load and unload app properly", async () => {

        using app = await SinglePageApplication.start("LoadTest", x => {
            x.addPart("/:part<moon>", x => x.configure(x => x.addSingleton(CustomService)));
            x.addPart("/:part<sun>?sun", x => x.configure(x => x.addSingleton(CustomService)));
        });

        const firstApp = app.activeChild!;
        assert.isDefined(firstApp);
        assert.equal(firstApp.name, "sun");

        const firstService = firstApp.services.get(ICustomService)!;
        assert.isDefined(firstService);
        assert.equal(firstService.setupCount, 1);
        assert.equal(firstService.activateCount, 1);
        assert.equal(firstService.deactivateCount, 0);

        await app.navigate("/moon");

        assert.equal(firstService.setupCount, 1);
        assert.equal(firstService.activateCount, 1);
        assert.equal(firstService.deactivateCount, 1);

        const secondApp = app.activeChild!;
        assert.isDefined(secondApp);
        assert.equal(secondApp.name, "moon");

        const secondService = secondApp.services.get(ICustomService)!;
        assert.isDefined(secondService);
        assert.notEqual(firstService, secondService);
        assert.equal(secondService.setupCount, 1);
        assert.equal(secondService.activateCount, 1);
        assert.equal(secondService.deactivateCount, 0);

        await app.navigate("/sun");

        assert.equal(secondService.setupCount, 1);
        assert.equal(secondService.activateCount, 1);
        assert.equal(secondService.deactivateCount, 1);

        const thirdApp = app.activeChild!;
        assert.isDefined(thirdApp);
        assert.equal(thirdApp.name, "sun");

        const thirdService = thirdApp.services.get(ICustomService)!;
        assert.isDefined(thirdService);
        assert.equal(firstService, thirdService);
        assert.equal(thirdService.setupCount, 1);
        assert.equal(thirdService.activateCount, 2);
        assert.equal(thirdService.deactivateCount, 1);
    });

});
