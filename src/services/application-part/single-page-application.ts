import { Constructor } from "@aster-js/core";
import { IIoCModule, ILogger, IoCKernel, LogLevel, ServiceContract } from "@aster-js/ioc";
import { AppConfigureDelegate, IAppConfigureHandler, IApplicationPart, IApplicationPartBuilder } from "../abstraction";
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
        builder.configure(x => {
            x.addConsoleLogger(LogLevel.trace)
                .addSystemClock();
        });
        return builder.build();
    }

    async start(): Promise<boolean> {
        return await this.parent.start()
            && await super.start();
    }

    private static createApp(kernel: IIoCModule, appName: string, handlerCtor: Constructor<IAppConfigureHandler>): IApplicationPartBuilder {
        const builder = kernel.services.createInstance(ApplicationPartBuilder, appName, kernel);

        const handler = kernel.services.createInstance(handlerCtor);
        handler.configure(builder);
        return builder;
    }

    static async start(appName: string, configure: AppConfigureDelegate): Promise<SinglePageApplication> {
        const app = new SinglePageApplication(appName, class { configure = configure; });
        await app.start();
        await app.ready;
        return app;
    }
}
