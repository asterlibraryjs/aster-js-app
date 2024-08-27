import { assert } from "chai";
import { ApplicationPartSetup, SinglePageApplication, IApplicationPart, ApplicationPartLifecycleHooks, createApplicationPartLifecycleClassDecorator } from "../src";
import { ServiceContract, ServiceIdentifier } from "@aster-js/ioc";

describe("NavigationService", () => {

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

});
