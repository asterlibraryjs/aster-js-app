import { ServiceIdentifier } from "@aster-js/ioc";
import { Route } from "./route";
import { RouteData } from "./routing-invocation-context";
import { IApplicationPart } from "../abstraction";

export const IRoutingHandler = ServiceIdentifier<IRoutingHandler>("IRoutingHandler");

/**
 * Service ID and Implementation for routing handler.
 * A routing handler is in charge handling matching navigation
 */
export interface IRoutingHandler {
    /** Route to match with. This route will also extract data from the url */
    readonly route: Route;
    /**
     * Method called when the  route match
     * @param data Route data that contains route values and query values
     * @param app Application that handle the route
     */
    handle(data: RouteData, app: IApplicationPart): Promise<void>;
}
