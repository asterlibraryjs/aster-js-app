import { AbortToken } from "@aster-js/async";
import { Constructor, IDisposable } from "@aster-js/core";
import { IIoCModule, ServiceContract, ServiceProvider, ServiceScope } from "@aster-js/ioc";
import { IAppConfigureHandler, IApplicationPart, IApplicationPartBuilder } from "../abstraction";
import { ApplicationPartBuilder } from "./application-part-builder";

@ServiceContract(IApplicationPart)
export class ApplicationPart implements IApplicationPart {
    private readonly _module: IIoCModule;

    get name(): string { return this._name; }

    get parent(): IIoCModule { return this._parent; }

    get running(): boolean { return this._module.running; }

    get ready(): PromiseLike<void> { return this._module.ready; }

    get abortToken(): AbortToken { return this._module.abortToken; }

    get services(): ServiceProvider { return this._module.services; }

    constructor(
        private readonly _name: string,
        private readonly _parent: IIoCModule,
        builder: IApplicationPartBuilder
    ) {
        this._module = builder
            .configure(x => x.addInstance(IApplicationPart, this, { scope: ServiceScope.container }))
            .build();
    }

    start(): Promise<boolean> { return this._module.start(); }

    async load(name: string, handlerCtor: Constructor<IAppConfigureHandler>): Promise<void> {
        const builder = this.createChildScope(name);

        const handler = this.services.createInstance(handlerCtor);
        handler.configure(builder, this);

        const part = builder.build();
        await part.start();
    }

    createChildScope(name: string): IApplicationPartBuilder {
        return this.services.createInstance(ApplicationPartBuilder, name, this._module);
    }

    [Symbol.dispose](): void {
        IDisposable.safeDispose(this._module);
    }

    *[Symbol.iterator](): Iterator<IIoCModule> {
        yield* this._module;
    }
}
