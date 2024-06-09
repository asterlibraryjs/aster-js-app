import { AppServiceId } from "../../abstraction/app-service-id";

import { IRouteData } from "./iroute-data";

/**
 * Service id and contract to store route data and query data result of navigation of current route configuration.
 *
 * To get part route data (route data registered by part route declarations), use IPartRouteData service.
 */
export const IContainerRouteData = AppServiceId<IContainerRouteData>("IContainerRouteData")

export type IContainerRouteData = IRouteData;
