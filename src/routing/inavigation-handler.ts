import { ServiceIdentifier } from "@aster-js/ioc";

export const INavigationHandler = ServiceIdentifier<INavigationHandler>("INavigationHandler");

export interface INavigationHandler {
    start(): void;
    stop(): void;
}
