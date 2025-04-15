import { Constructor } from "@aster-js/core";
import { IApplicationPart } from "./iapplication-part";
import { IApplicationPartBuilder } from "./iapplication-part-builder";
import { configure, IAppConfigureHandler } from "./iapp-configure-handler";

export const beforeConfigure = Symbol("beforeConfigure");
export const afterConfigure = Symbol("afterConfigure");

export type NextAppConfigureMiddlewareCallback = (builder: IApplicationPartBuilder, host?: IApplicationPart) => void;

/**
 * Middleware that will do additional configuration on a IAppConfigureHandler.
 *
 * Middleware allows to share implementations or distribute extensions.
 */
export interface IAppConfigureMiddleware {
    [configure](builder: IApplicationPartBuilder, host: IApplicationPart | undefined, next: NextAppConfigureMiddlewareCallback): void;
}

/**
 * Apply a middle on a IAppConfigureHandler
 * @param type Type of the middleware
 * @param args Arguments to construct the middleware
 * @returns Returns method decorator
 */
export function UseConfigureMiddleware<T extends IAppConfigureMiddleware, TArgs extends any[] = any[]>(type: Constructor<T, TArgs>, args: TArgs) {
    return <TCtor extends Constructor<IAppConfigureHandler>>(target: TCtor) => {
        return class extends target {
            [configure](builder: IApplicationPartBuilder, host?: IApplicationPart): void {
                const next = super[configure].bind(this);
                const middleware = new type(...args);
                middleware[configure](builder, host, next);
            }
        }
    };
}
