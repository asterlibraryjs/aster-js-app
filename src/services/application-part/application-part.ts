import { AbortToken } from "@aster-js/async";
import { Constructor, IDisposable } from "@aster-js/core";
import { IIoCContainerBuilder, IIoCModule, ServiceContract, ServiceProvider, ServiceScope } from "@aster-js/ioc";
import { IAppConfigureHandler, IApplicationPart, IApplicationPartBuilder } from "../abstraction";
import { ApplicationPartBuilder } from "./application-part-builder";
import { Memoize } from "@aster-js/decorators";

export class ApplicationPart implements IApplicationPart {
    private readonly _module: IIoCModule;

    get name(): string { return this._module.name; }

    get parent(): IIoCModule { return this._parent; }

    get running(): boolean { return this._module.running; }

    @Memoize
    get ready(): PromiseLike<this> { return this._module.ready.then(() => this); }

    get abortToken(): AbortToken { return this._module.abortToken; }

    get services(): ServiceProvider { return this._module.services; }

    constructor(
        private readonly _parent: IIoCModule,
        builder: IIoCContainerBuilder
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
        return new ApplicationPartBuilder(name, this._module);
    }

    [Symbol.dispose](): void {
        IDisposable.safeDispose(this._module);
    }

    *[Symbol.iterator](): Iterator<IIoCModule> {
        yield* this._module;
    }
}
