import { IRouteSegment } from "./iroute-segment";
import { AppServiceId } from "../../abstraction/app-service-id";

export const IRouteParser = AppServiceId<IRouteParser>("IRouteParser");

/**
 * Service ID and Implementation for a service that parse a route string into a sequence of route segments
 */
export interface IRouteParser {
    /**
     * Parse a route string into a sequence of route segments
     * @param route Route string
     */
    parse(route: string): Iterable<IRouteSegment>;
}
