import { IApplicationPart } from "../../abstraction/iapplication-part";
import { AppServiceId } from "../../abstraction/app-service-id";
import { RouteData } from "./../route-data/route-data";
import { RoutingInvocationContext } from "../routing-invocation-context";

export const IRoutingHandler = AppServiceId<IRoutingHandler>("IRoutingHandler");

/**
 * Service ID and Implementation for routing handler.
 * A routing handler is in charge handling matching navigation
 */
export interface IRoutingHandler {
    /** Gets the string path used to describe the route */
    readonly path: string;
    /**
     * Method called when the  route match
     * @param ctx Invocation context
     */
    handle(ctx: RoutingInvocationContext): Promise<void>;
}
