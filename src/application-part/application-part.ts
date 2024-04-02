import { AbortToken, Delayed } from "@aster-js/async";
import { Constructor, DisposableHost, IDisposable } from "@aster-js/core";
import { IIoCContainerBuilder, IIoCModule, ILogger, IServiceDescriptor, ServiceCollection, ServiceIdentity, ServiceProvider, ServiceScope } from "@aster-js/ioc";
import { AppConfigureDelegate, configure, IAppConfigureHandler, IApplicationPart, IApplicationPartBuilder } from "../abstraction";
import { Memoize } from "@aster-js/decorators";
import { ApplicationPartLifecycleHook, ApplicationPartLifecycleHooks, IApplicationPartLifecycle } from "./iapplication-part-lifecycle";
import { ApplicationPartLifecycleWrapper } from "./application-part-lifecycle-wrapper";
import { ContainerRouteData, DefaultRoutingHandlerInvoker, DefaultRouter, PartRouteData, DefaultRouteParser, DefaultRoutingTable } from "../routing";
import { DefaultNavigationService } from "../navigation/navigation-service";
import { Iterables } from "@aster-js/iterators";
import { DefaultUrlValueConverterFactory } from "../routing/url-value-converter/default-url-value-converter-factory";
import { DefaultUrlValueValidatorFactory } from "../routing/url-value-validator/default-url-value-validator-factory";

export abstract class ApplicationPart extends DisposableHost implements IApplicationPart {
    private readonly _module: IIoCModule;
    private readonly _children: Map<string, IApplicationPart> = new Map();
    private readonly _logger: ILogger;
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
        builder: IIoCContainerBuilder
    ) {
        super();
        this._module = builder
            .configure(x => this.configureMandatoryAppPartServices(x))
            .setup(IApplicationPart, x => {
                ApplicationPartLifecycleHooks.invoke(x, ApplicationPartLifecycleHooks.setup)
            }, true)
            .build();
        this._logger = this._module.services.get(ILogger, true);
    }

    private configureMandatoryAppPartServices(services: ServiceCollection): void {
        services.addInstance(IApplicationPart, this, { scope: ServiceScope.container })
            .addScoped(PartRouteData, { scope: ServiceScope.container })
            .addScoped(ContainerRouteData, { scope: ServiceScope.container })
            .addScoped(DefaultNavigationService, { scope: ServiceScope.container })
            .addSingleton(DefaultUrlValueConverterFactory)
            .addSingleton(DefaultUrlValueValidatorFactory)
            .addSingleton(DefaultRouteParser)
            .addSingleton(DefaultRoutingTable, { scope: ServiceScope.container })
            .addScoped(DefaultRouter, { scope: ServiceScope.container })
            .addScoped(DefaultRoutingHandlerInvoker, { scope: ServiceScope.container });

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
            child.registerForDispose(IDisposable.create(() => this.deleteChild(child.name)));
        }
    }

    private deleteChild(name: string): void {
        const current = this._children.get(name);
        if (current) {
            IDisposable.safeDispose(current);
            this._children.delete(name);

            if (current === this._current) {
                delete this._current;
            }
        }
    }

    start(): Promise<boolean> { return this._module.start(); }

    async load(name: string, configHandler: Constructor<IAppConfigureHandler> | AppConfigureDelegate): Promise<IApplicationPart> {
        const current = this._children.get(name);
        if (current) {
            await this.activate(name);
            return current;
        }

        const builder = this.createAppBuilder(name);

        const handlerCtor = IAppConfigureHandler.resolve(configHandler);
        const handler = this.services.createInstance(handlerCtor);
        handler[configure](builder, this);

        const part = builder.build();
        await part.start();
        await this.activate(name);
        return <IApplicationPart>part;
    }

    async activate(name: string): Promise<void> {
        if (!name) throw new Error(`"name" parameter cannot be null or empty`);

        if (this._current?.name === name) {
            this._logger.debug(`Part "{name}" is already activated`, name);
            return;
        }

        const part = this._children.get(name);
        if (part) {
            if (this._current) {
                const allParts = [...Iterables.create(this._current, x => x.activeChild)].reverse();
                for (const part of allParts) {
                    this.desactivatePart(part);
                }
            }

            await this.activatePart(part);
            this._current = part;
        }
        else {
            this._logger.error(null, `Cannot find any part named "{name}"`, name);
        }
    }

    protected async activatePart(part: IApplicationPart): Promise<void> {
        this._logger.debug(`Activating part "{name}"`, part.name);
        try {
            await ApplicationPartLifecycleHooks.invoke(part, ApplicationPartLifecycleHooks.activated);
            this._logger.info(`Part "{name}" activated`, part.name);
        }
        catch (err) {
            this._logger.error(err, `Error while activating part "{name}"`, part.name);
            return;
        }
    }

    private async desactivatePart(part: IApplicationPart): Promise<boolean> {
        this._logger.debug(`Desactivating current active parts from "{path}"`, part.path);
        try {
            await ApplicationPartLifecycleHooks.invoke(part, ApplicationPartLifecycleHooks.deactivated);
            if (part instanceof ApplicationPart) {
                delete part._current;
            }
            this._logger.info(`Part "{path}" desactivated`, part.path);
            return true;
        }
        catch (err) {
            this._logger.error(err, `Error while desactivating part "{path}"`, part.path);
            return false;
        }
    }

    createChildScope(name: string): IIoCContainerBuilder {
        this.throwIfExists(name);
        return this._module.createChildScope(name);
    }

    private throwIfExists(name: string) {
        if (this._children.has(name)) {
            throw new Error(`An application part with the same name already exists`);
        }
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
