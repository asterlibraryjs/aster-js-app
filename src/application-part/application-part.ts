import { AbortToken, assertAllSettledResult, Delayed } from "@aster-js/async";
import { Constructor, DisposableHost, IDisposable } from "@aster-js/core";
import { IIoCContainerBuilder, IIoCModule, IServiceDescriptor, IServiceFactory, IServiceProvider, ServiceCollection, ServiceIdentifier, ServiceProvider, ServiceScope } from "@aster-js/ioc";
import { configure, IAppConfigureHandler, IApplicationPart, IApplicationPartBuilder } from "../abstraction";
import { Memoize } from "@aster-js/decorators";
import { ApplicationPartLifecycleHook, ApplicationPartLifecycleHooks, IApplicationPartLifecycle } from "./iapplication-part-lifecycle";
import { ApplicationPartLifecycleWrapper } from "./application-part-lifecycle-wrapper";

export abstract class ApplicationPart extends DisposableHost implements IApplicationPart {
    private readonly _module: IIoCModule;
    private readonly _children: Map<string, IApplicationPart> = new Map();
    private _current?: IApplicationPart;

    get name(): string { return this._module.name; }

    get path(): string { return this._module.path; }

    abstract get parent(): IIoCModule;

    get running(): boolean { return this._module.running; }

    get activeChild(): IApplicationPart | undefined { return this._current; }

    @Memoize
    get ready(): PromiseLike<this> { return this._module.ready.then(() => this); }

    get abortToken(): AbortToken { return this._module.abortToken; }

    get services(): ServiceProvider { return this._module.services; }

    constructor(
        builder: IIoCContainerBuilder,
    ) {
        super();
        this._module = builder
            .configure(x => this.configureMandatoryAppPartServices(x))
            .setupMany(IApplicationPartLifecycle, x => {
                return ApplicationPartLifecycleHooks.invoke(x, ApplicationPartLifecycleHooks.setup);
            }, true)
            .build();
    }

    private configureMandatoryAppPartServices(services: ServiceCollection): void {
        services.addInstance(IApplicationPart, this, { scope: ServiceScope.container });

        for (const desc of this.extractImplicitLifecycleImpl(services)) {
            services.addTransient(ApplicationPartLifecycleWrapper, { baseArgs: [desc], scope: ServiceScope.container });
        }
    }

    private extractImplicitLifecycleImpl(services: ServiceCollection): IServiceDescriptor[] {
        const explicitLifeCycles = new Set();
        const implicitLifeCycles = [];

        for (const desc of services) {
            if (desc.serviceId === IApplicationPartLifecycle) {
                explicitLifeCycles.add(desc.targetType);
            }
            else if (ApplicationPartLifecycleHooks.hasAny(desc.ctor)) {
                implicitLifeCycles.push(desc);
            }
        }

        return implicitLifeCycles.filter(x => !explicitLifeCycles.has(x.targetType));
    }

    getChild(name: string): IApplicationPart | undefined {
        return this._children.get(name);
    }

    protected async addChild(delayedChild: Delayed<IApplicationPart>): Promise<void> {
        const child = await delayedChild.get();

        const current = this._children.get(child.name);
        IDisposable.safeDispose(current);

        this._children.set(child.name, child);

        if (child instanceof DisposableHost) {
            child.registerForDispose(IDisposable.create(() => {
                const current = this._children.get(child.name);
                if (current === child) {
                    this._children.delete(child.name);
                }
                if (this._current === child) {
                    delete this._current;
                }
            }));
        }
    }

    start(): Promise<boolean> { return this._module.start(); }

    async load(name: string, handlerCtor: Constructor<IAppConfigureHandler>): Promise<IApplicationPart> {
        const current = this._children.get(name);
        if (current) {
            await this.activate(name);
            return current;
        }

        const builder = this.createAppBuilder(name);

        const handler = this.services.createInstance(handlerCtor);
        handler[configure](builder, this);

        const part = builder.build();
        await part.start();
        await this.activate(name);
        return <IApplicationPart>part;
    }

    async activate(name: string): Promise<void> {
        const part = this._children.get(name);
        if (part) {
            await this.activatePart(part);
            this._current = part;
        }
        else {
            throw new Error(`Cannot find any module named ${name}`);
        }
    }

    protected async activatePart(part: IApplicationPart): Promise<void> {
        if (this._current) await this.invokeLifecycleHook(this._current, ApplicationPartLifecycleHooks.deactivated);
        await this.invokeLifecycleHook(part, ApplicationPartLifecycleHooks.activated);
    }

    private async invokeLifecycleHook(part: IApplicationPart, hook: ApplicationPartLifecycleHook): Promise<void> {
        const promises = [];
        for (const svc of part.services.getAll(IApplicationPartLifecycle, true)) {
            const result = ApplicationPartLifecycleHooks.invoke(svc, hook);
            promises.push(result);
        }
        const allSettledResult = await Promise.allSettled(promises);
        assertAllSettledResult(allSettledResult);
    }

    createChildScope(name: string): IIoCContainerBuilder {
        this.throwIfExists(name);
        return this._module.createChildScope(name);
    }

    private throwIfExists(name: string) {
        const current = this._children.get(name);
        if (current) throw new Error(`An application part with the same name already exists`);
    }

    protected abstract createAppBuilder(name: string): IApplicationPartBuilder;

    [Symbol.dispose](): void {
        delete this._current;
        IDisposable.safeDispose(this._children.values());
        IDisposable.safeDispose(this._module);
    }

    async *[Symbol.asyncIterator](): AsyncIterator<IIoCModule, any, undefined> {
        yield* this._children.values();
    }
}
