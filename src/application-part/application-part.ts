import { AbortToken, Delayed } from "@aster-js/async";
import { Constructor, DisposableHost, IDisposable } from "@aster-js/core";
import { IIoCContainerBuilder, IIoCModule, ILogger, ServiceProvider } from "@aster-js/ioc";
import { AppConfigureDelegate, configure, IAppConfigureHandler, IApplicationPart, IApplicationPartBuilder } from "../abstraction";
import { Memoize } from "@aster-js/decorators";
import { ApplicationPartLifecycleHooks } from "./iapplication-part-lifecycle";
import { Route } from "../routing";
import { Iterables } from "@aster-js/iterators";
import { createApplicationPartModule } from "./default-application-part-services";

export abstract class ApplicationPart extends DisposableHost implements IApplicationPart {
    private readonly _module: IIoCModule;
    private readonly _children: Map<string, IApplicationPart> = new Map();
    private _current: [Route, IApplicationPart] | [] = [];

    get name(): string { return this._module.name; }

    get path(): string { return this._module.path; }

    abstract get parent(): IIoCModule;

    get running(): boolean { return this._module.running; }

    get activeRoute(): Route | undefined { return this._current[0]; }

    get activeChild(): IApplicationPart | undefined { return this._current[1]; }

    @Memoize
    get ready(): PromiseLike<this> { return this._module.ready.then(() => this); }

    get abortToken(): AbortToken { return this._module.abortToken; }

    get services(): ServiceProvider { return this._module.services; }

    @Memoize
    get logger(): ILogger { return this._module.services.get(ILogger, true); }

    constructor(
        builder: IIoCContainerBuilder
    ) {
        super();
        this.registerForDispose(
            this._module = createApplicationPartModule(this, builder)
        );
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
            this._children.delete(name);

            if (current === this._current[1]) {
                this._current = [];
            }
        }
    }

    /**
     *
     * @returns
     */
    start(): Promise<boolean> { return this._module.start(); }

    /**
     * Load a new application part as a child of the current part and activate it
     * @param name The name of the part
     * @param route The route that will be used to activate the part
     * @param configHandler The configuration handler used to configure the part
     * @returns The loaded part
     */
    async load(name: string, route: Route, configHandler: Constructor<IAppConfigureHandler> | AppConfigureDelegate): Promise<IApplicationPart> {
        const current = this._children.get(name);
        if (current) {
            await this.activate(name, route);
            return current;
        }

        const builder = this.createAppBuilder(name);

        const handlerCtor = IAppConfigureHandler.resolve(configHandler);
        const handler = this.services.createInstance(handlerCtor);
        handler[configure](builder, this);

        const part = builder.build();
        await part.start();
        await this.activate(name, route);
        return <IApplicationPart>part;
    }

    async activate(name: string, route: Route): Promise<void> {
        if (!name) throw new Error(`"name" parameter cannot be null or empty`);

        if (this._current[0] === route && this._current[1]?.name === name) {
            this.logger.debug(`Part "{name}" is already activated`, name);
            return;
        }

        const part = this._children.get(name);
        if (part) {
            await this.desactivateCurrent();

            await this.activatePart(part);
            this._current = [route, part];
        }
        else {
            this.logger.error(null, `Cannot find any part named "{name}"`, name);
        }
    }

    async desactivate(name: string): Promise<void> {
        if (this._current[1]?.name === name) {
            await this.desactivateCurrent();
        }
    }

    protected async desactivateCurrent(): Promise<void> {
        const current = this._current[1];
        if (current) {
            const allParts = [...Iterables.create(current, x => x.activeChild)].reverse();
            for (const part of allParts) {
                await this.desactivatePart(part);
            }
        }
        this._current = [];
    }

    protected async activatePart(part: IApplicationPart): Promise<void> {
        this.logger.debug(`Activating part "{name}"`, part.name);
        try {
            await ApplicationPartLifecycleHooks.invoke(part, ApplicationPartLifecycleHooks.activated);
            this.logger.info(`Part "{name}" activated`, part.name);
        }
        catch (err) {
            this.logger.error(err, `Error while activating part "{name}"`, part.name);
            return;
        }
    }

    private async desactivatePart(part: IApplicationPart): Promise<boolean> {
        this.logger.debug(`Desactivating current active parts from "{path}"`, part.path);
        try {
            await ApplicationPartLifecycleHooks.invoke(part, ApplicationPartLifecycleHooks.deactivated);
            if (part instanceof ApplicationPart) {
                part._current = [];
            }
            this.logger.info(`Part "{path}" desactivated`, part.path);
            return true;
        }
        catch (err) {
            this.logger.error(err, `Error while desactivating part "{path}"`, part.path);
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

    protected dispose?(): void {
        this._current = [];
        IDisposable.safeDispose(this._children.values());
    }

    async *[Symbol.asyncIterator](): AsyncIterator<IIoCModule, any, undefined> {
        yield* this._children.values();
    }
}
