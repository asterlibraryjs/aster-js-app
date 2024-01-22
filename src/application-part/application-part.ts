import { AbortToken, Delayed } from "@aster-js/async";
import { Constructor, DisposableHost, IDisposable } from "@aster-js/core";
import { IIoCContainerBuilder, IIoCModule, IoCModule, ServiceProvider, ServiceScope } from "@aster-js/ioc";
import { configure, IAppConfigureHandler, IApplicationPart, IApplicationPartBuilder } from "../abstraction";
import { Memoize } from "@aster-js/decorators";

export abstract class ApplicationPart extends DisposableHost implements IApplicationPart {
    private readonly _module: IIoCModule;
    private readonly _children: IApplicationPart[] = [];

    get name(): string { return this._module.name; }

    get path(): string { return this._module.path; }

    abstract get parent(): IIoCModule;

    get running(): boolean { return this._module.running; }

    @Memoize
    get ready(): PromiseLike<this> { return this._module.ready.then(() => this); }

    get abortToken(): AbortToken { return this._module.abortToken; }

    get services(): ServiceProvider { return this._module.services; }

    constructor(
        builder: IIoCContainerBuilder,
    ) {
        super();
        this._module = builder
            .configure(x => x.addInstance(IApplicationPart, this, { scope: ServiceScope.container }))
            .build();
    }

    protected async addChild(delayedChild: Delayed<IApplicationPart>): Promise<void> {
        const child = await delayedChild.get();
        this._children.push(child);

        if (child instanceof DisposableHost) {
            child.registerForDispose(IDisposable.create(() => {
                const idx = this._children.indexOf(child);
                if (idx !== -1) this._children.splice(idx, 1);
            }));
        }
    }

    start(): Promise<boolean> { return this._module.start(); }

    async load(name: string, handlerCtor: Constructor<IAppConfigureHandler>): Promise<void> {
        const builder = this.createAppBuilder(name);

        const handler = this.services.createInstance(handlerCtor);
        handler[configure](builder, this);

        const part = builder.build();
        await part.start();
    }

    createChildScope(name: string): IIoCContainerBuilder {
        return this._module.createChildScope(name);
    }

    protected abstract createAppBuilder(name: string): IApplicationPartBuilder;

    [Symbol.dispose](): void {
        IDisposable.safeDispose(this._module);
    }

    async *[Symbol.asyncIterator](): AsyncIterator<IIoCModule, any, undefined> {
        yield* this._children;
    }
}
