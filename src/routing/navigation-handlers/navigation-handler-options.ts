import { ServiceIdentifier } from "@aster-js/ioc";


export const NavigationHandlerOptions = ServiceIdentifier<NavigationHandlerOptions>("NavigationHandlerOptions");

export type NavigationHandlerOptions = {
    readonly supportHrefTags: string;
};
