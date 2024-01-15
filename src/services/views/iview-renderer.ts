import { IDisposable } from "@aster-js/core";
import { ServiceIdentifier } from "@aster-js/ioc";

export const IViewRender = ServiceIdentifier<IViewRender>("IViewRender");

export interface IViewRender extends IDisposable {
    readonly root: HTMLElement;
}
