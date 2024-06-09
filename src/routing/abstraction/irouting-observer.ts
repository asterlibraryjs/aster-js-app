import { AppServiceId } from "../../abstraction/app-service-id";
import { IApplicationPart } from "../../abstraction/iapplication-part";
import { RouteData } from "../route-data/route-data";

import { IRoutingHandler } from "./irouting-handler";

export const IRoutingObserver = AppServiceId<IRoutingObserver>("IRoutingObserver");
export interface IRoutingObserver {

    onRoutingDidBegin(handler: IRoutingHandler, routeData: RouteData, application: IApplicationPart): Promise<void>;

    onRoutingDidComplete(handler: IRoutingHandler, routeData: RouteData, application: IApplicationPart): Promise<void>;

    onRoutingDidFail(handler: IRoutingHandler, routeData: RouteData, application: IApplicationPart): Promise<void>;
}