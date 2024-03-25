import { assert } from "chai";
import { CallbackConfigureHandler, IAppConfigureHandler, configure } from "./iapp-configure-handler";
import * as sinon from "sinon";


describe("IAppConfigureHandler", () => {

    it("Should create a new handler from a callback", () => {
        const spy = sinon.spy();
        const handler = IAppConfigureHandler.create(spy);
        const instance = new handler();

        assert.instanceOf(instance, CallbackConfigureHandler);

        instance[configure](<any>null);
    });

    it("Should resole a new handler", () => {
        const spy = sinon.spy();
        const handler = IAppConfigureHandler.resolve(spy);
        const instance = new handler();

        assert.instanceOf(instance, CallbackConfigureHandler);

        instance[configure](<any>null);
        sinon.assert.calledOnce(spy);
    });

    it("Should return the provided handler", () => {
        const spy = sinon.spy();
        const handler = IAppConfigureHandler.resolve(CallbackConfigureHandler);

        assert.equal(handler, CallbackConfigureHandler);

        const instance = new handler(spy);

        assert.instanceOf(instance, CallbackConfigureHandler);

        instance[configure](<any>null);
        sinon.assert.calledOnce(spy);
    });
})
