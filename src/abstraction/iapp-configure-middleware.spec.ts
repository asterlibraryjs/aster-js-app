import { assert } from "chai";
import { IApplicationPartBuilder } from "./iapplication-part-builder";
import { IApplicationPart } from "./iapplication-part";
import { configure, IAppConfigureHandler } from "./iapp-configure-handler";
import {
    afterConfigure,
    beforeConfigure,
    IAppConfigureMiddleware,
    NextAppConfigureMiddlewareCallback,
    UseConfigureMiddleware
} from "./iapp-configure-middleware";
import { Inject, resolveServiceId } from "@aster-js/ioc";
import { SinglePageApplication } from "../application-part";

class LifetimeService {

    constructor(public state: number, readonly startedState: number) { }

    start(): void {
        this.state = this.startedState;
    }
}

class AppService {
    constructor(@Inject(LifetimeService) private readonly _lifetime: LifetimeService) { }

    start() {
        if (this._lifetime.state === this._lifetime.startedState) throw new Error("Unexpected LifetimeService state");
    }
}

class LifetimeMiddleware implements IAppConfigureMiddleware {

    constructor(private readonly _initialState: number, private readonly _startedState: number) { }

    [configure](builder: IApplicationPartBuilder, host: IApplicationPart | undefined, next: NextAppConfigureMiddlewareCallback): void {
        builder.configure(x => x.addSingleton(LifetimeService, { baseArgs: [this._initialState, this._startedState] }));
        next(builder, host);
        builder.setup(LifetimeService, x => x.start());
    }
}

@UseConfigureMiddleware(LifetimeMiddleware, [55, 64])
class MyAppConfigureHandler implements IAppConfigureHandler {
    [configure](builder: IApplicationPartBuilder): void {
        builder.configure(x => x.addSingleton(AppService));
        builder.setup(AppService, x => x.start());
    }
}

describe("IAppConfigureMiddleware", () => {
    it("Should initiate in proper order the configure middleware", async () => {
        using app = await SinglePageApplication.start("bob", MyAppConfigureHandler);
        const serviceId = resolveServiceId(LifetimeService)
        const lifetime = app.services.get(serviceId, true);
        assert.equal(lifetime.state, lifetime.startedState);
    });
});
