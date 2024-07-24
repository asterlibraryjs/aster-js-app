import { RouteValues } from "../route-data/route-values";
import { AppServiceId } from "../../abstraction/app-service-id";

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
    eval(path: string, defaults?: RouteValues): Promise<boolean>;
}
