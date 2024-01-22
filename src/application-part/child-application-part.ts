import { Delayed } from "@aster-js/async";
import { DisposableHost } from "@aster-js/core";
import { IIoCModule, IIoCContainerBuilder } from "@aster-js/ioc";
import { IApplicationPart, IApplicationPartBuilder } from "../abstraction";
import { ApplicationPart } from "./application-part";
import { ApplicationPartBuilder } from "./application-part-builder";

export class ChildApplicationPartBuilder extends ApplicationPartBuilder {
    constructor(
        partName: string,
        source: IApplicationPart,
        result: Delayed<IApplicationPart>
    ) {
        super(partName, source, result);
    }

    protected createApplicationPart(parent: IApplicationPart, iocBuilder: IIoCContainerBuilder): IApplicationPart {
        return new ChildApplicationPart(parent, iocBuilder);
    }
}

export class ChildApplicationPart extends ApplicationPart {

    get parent(): IApplicationPart { return this._parent; }

    constructor(
        private readonly _parent: IApplicationPart,
        builder: IIoCContainerBuilder
    ) {
        super(builder);
    }

    protected createAppBuilder(name: string): IApplicationPartBuilder {
        const result = new Delayed<IApplicationPart>();
        this.addChild(result);
        return new ChildApplicationPartBuilder(name, this, result);
    }
}
