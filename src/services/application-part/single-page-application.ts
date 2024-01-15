import { Constructor } from "@aster-js/core";
import { IIoCModule, IoCKernel, IoCModule, ServiceContract } from "@aster-js/ioc";
import { IAppConfigureHandler, IApplicationPart, IApplicationPartBuilder } from "../abstraction";
import { ApplicationPart } from "./application-part";
import { ApplicationPartBuilder } from "./application-part-builder";

@ServiceContract(IApplicationPart)
export class SinglePageApplication extends ApplicationPart {

    constructor(appName: string, handlerCtor: Constructor<IAppConfigureHandler>) {
        const kernel = SinglePageApplication.createKernel();
        const builder = SinglePageApplication.createApp(kernel, appName, handlerCtor);
        super(appName, kernel, builder);
    }

    private static createKernel() {
        const builder = IoCKernel.create();
        // builder.configure(x => { });
        return builder.build();
    }

    async start(): Promise<boolean> {
        return await this.parent.start()
            && await super.start();
    }

    private static createApp(kernel: IIoCModule, appName: string, handlerCtor: Constructor<IAppConfigureHandler>) : IApplicationPartBuilder {
        const builder = kernel.services.createInstance(ApplicationPartBuilder, appName, kernel);

        const handler = kernel.services.createInstance(handlerCtor);
        handler.configure(builder);
        return builder;
    }

    static async start(appName: string, handlerCtor: Constructor<IAppConfigureHandler>): Promise<SinglePageApplication> {
        const app = new SinglePageApplication(appName, handlerCtor);
        await app.start();
        return app;
    }
}
