import { IIoCContainerBuilder, ServiceIdentifier } from "@aster-js/ioc";
import { RouterAction } from "../routing/irouting-handler";
import { ServiceRouterAction } from "../routing/routing-handlers/service-routing-handler";

export interface IApplicationPartBuilder extends IIoCContainerBuilder {
    addAction<T>(path: string, serviceId: ServiceIdentifier, action: ServiceRouterAction<T>): IIoCContainerBuilder;
    addAction(path: string, action: RouterAction): IIoCContainerBuilder;
}
