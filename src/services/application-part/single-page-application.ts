import { Constructor, asserts } from "@aster-js/core";
import { IIoCContainerBuilder, IIoCModule, IoCKernel, LogLevel, ServiceContract } from "@aster-js/ioc";
import { AppConfigureDelegate, IAppConfigureHandler, IApplicationPart, IApplicationPartBuilder } from "../abstraction";
import { ApplicationPart } from "./application-part";
import { ApplicationPartBuilder } from "./application-part-builder";
import { DefaultApplicationConfigureHandler } from "./default-application-configure-handler";

class SinglePageAppBuilder extends ApplicationPartBuilder {

    protected createApplicationPart(parent: IIoCModule, iocBuilder: IIoCContainerBuilder): IApplicationPart {
        return new SinglePageApplication(parent, iocBuilder);
    }
}

export class SinglePageApplication extends ApplicationPart {

    constructor(
        parent: IIoCModule,
        builder: IIoCContainerBuilder
    ) {
        super(parent, builder);
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
        return await this.parent.start() && await super.start();
    }

    static create(appName: string, ...handlerCtors: Constructor<IAppConfigureHandler>[]): IApplicationPartBuilder {
        const kernel = SinglePageApplication.createKernel();

        const builder = new SinglePageAppBuilder(appName, kernel);
        for (const handlerCtor of handlerCtors) {
            const handler = kernel.services.createInstance(handlerCtor);
            handler.configure(builder);
        }
        return builder;
    }

    static async start(appName: string, configure: AppConfigureDelegate): Promise<SinglePageApplication> {
        const handler = IAppConfigureHandler.create(configure);
        const app = SinglePageApplication.create(appName, DefaultApplicationConfigureHandler, handler).build();
        await app.start();
        asserts.instanceOf(app, SinglePageApplication);
        return app;
    }
}
