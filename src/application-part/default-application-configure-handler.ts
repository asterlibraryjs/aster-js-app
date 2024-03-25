import { ServiceScope } from "@aster-js/ioc";
import { IApplicationPartBuilder, IApplicationPart } from "../abstraction";
import { configure, IAppConfigureHandler } from "../abstraction/iapp-configure-handler";
import { HyperlinkNavigationHandler, DefaultNavigationHandler, HistoryNavigationHandler } from "../routing";
import { RoutingOptions, defaultRoutingOptions } from "../routing/routing-options";

export class DefaultApplicationConfigureHandler implements IAppConfigureHandler {
    [configure](builder: IApplicationPartBuilder, host?: IApplicationPart | undefined): void {
        builder.configure(x => {
            x.addInstance(RoutingOptions, defaultRoutingOptions)
                .addSingleton(DefaultNavigationHandler, { scope: ServiceScope.container, baseArgs: [location] })
                .addSingleton(HistoryNavigationHandler, { scope: ServiceScope.container, baseArgs: [location, window] })
                .addSingleton(HyperlinkNavigationHandler, { scope: ServiceScope.container });
        });
    }
}
