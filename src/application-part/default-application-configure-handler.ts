import { ServiceScope } from "@aster-js/ioc";
import { IApplicationPartBuilder, IApplicationPart } from "../abstraction";
import { configure, IAppConfigureHandler } from "../abstraction/iapp-configure-handler";
import { HyperlinkNavigationHandler, DefaultRouter, DefaultNavigationHandler, HistoryNavigationHandler } from "../routing";
import { ContainerRouteData } from "../routing/icontainer-route-data";
import { RoutingOptions, defaultRoutingOptions } from "../routing/routing-options";
import { DefaultNavigationService } from "../navigation/navigation-service";
import { PartRouteData } from "../routing/ipart-route-data";

export class DefaultApplicationConfigureHandler implements IAppConfigureHandler {
    [configure](builder: IApplicationPartBuilder, host?: IApplicationPart | undefined): void {
        builder.configure(x => {
            x.addInstance(RoutingOptions, defaultRoutingOptions)
                .addSingleton(DefaultNavigationHandler, { scope: ServiceScope.container })
                .addSingleton(HistoryNavigationHandler, { scope: ServiceScope.container })
                .addSingleton(HyperlinkNavigationHandler, { scope: ServiceScope.container });
        });
    }
}
