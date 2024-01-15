import { IDisposable } from "@aster-js/core";
import { ServiceIdentifier } from "@aster-js/ioc";

export const INavigationHandler = ServiceIdentifier<INavigationHandler>("INavigationHandler");

export interface INavigationHandler extends IDisposable {
    start(): void;
    stop(): void;
}
