import { AppServiceId } from "../../abstraction/app-service-id";
import { IRouteData } from "./iroute-data";

/**
 * Service id and store for route data and query data result of navigation for the part itself.
 *
 * To get current route data (route data registered by current app route declarations), use IContainerRouteData service.
 */
export const IPartRouteData = AppServiceId<IPartRouteData>("IPartRouteData");

export type IPartRouteData = IRouteData;
