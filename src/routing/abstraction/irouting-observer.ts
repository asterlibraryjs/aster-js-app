import { AppServiceId } from "../../abstraction/app-service-id";
import { RoutingInvocationContext } from "../routing-invocation-context";

export const IRoutingObserver = AppServiceId<IRoutingObserver>("IRoutingObserver");
export interface IRoutingObserver {

    onRoutingDidBegin(ctx: RoutingInvocationContext): Promise<void>;

    onRoutingDidComplete(ctx: RoutingInvocationContext): Promise<void>;

    onRoutingDidFail(ctx: RoutingInvocationContext): Promise<void>;
}
