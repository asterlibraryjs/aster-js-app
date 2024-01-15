import { IIoCContainerBuilder } from "@aster-js/ioc";
import { RouterAction } from "../routing/irouting-handler";

export interface IApplicationPartBuilder extends IIoCContainerBuilder {
    addAction(path: string, action: RouterAction): void;
}
