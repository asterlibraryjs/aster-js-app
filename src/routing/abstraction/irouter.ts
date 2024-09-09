import { RouteValues } from "../route-data/route-values";
import { AppServiceId } from "../../abstraction/app-service-id";
import { Path } from "../path";
import { SearchValues } from "../route-data/search-values";

/**
 * Service Id and implementation for the service in charge of handling the application routing
 */
export const IRouter = AppServiceId<IRouter>("IRouter");
export interface IRouter {
    /**
     * Evaluate provided path in current application
     * @param path Path to evaluate
     * @param defaults Default route values
     */
    eval(path: string, defaults?: RouteValues): Promise<RoutingResult>;
}

export type RoutingResult = SuccessRoutingResult | FailureRoutingResult;

export namespace RoutingResult {
    export function success(path: Path | string, search: SearchValues): SuccessRoutingResult {
        if(Object.keys(search).length === 0) {
            return { success: true, relativeUrl: path.toString() };
        }
        return { success: true, relativeUrl: `${path}?${SearchValues.toString(search)}` };
    }

    export function failure(reason: string): FailureRoutingResult {
        return { success: false, reason };
    }
}

export interface SuccessRoutingResult {
    success: true;
    relativeUrl: string;
}

export interface FailureRoutingResult {
    success: false;
    reason: string;
}
