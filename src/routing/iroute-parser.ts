import { ServiceIdentifier } from "@aster-js/ioc";
import { IRouteSegment } from "./iroute-segment";

export const IRouteParser = ServiceIdentifier("IRouteParser");

export interface IRouteParser {
    parse(route: string): Iterable<IRouteSegment>;
}
