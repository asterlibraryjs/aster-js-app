import { ServiceIdentifier } from "@aster-js/ioc";
import { IRouteSegment } from "./iroute-segment";

export const IRouteParser = ServiceIdentifier({ name: "@aster-js/app/IRouteParser", unique: true });

export interface IRouteParser {
    parse(route: string): Iterable<IRouteSegment>;
}
