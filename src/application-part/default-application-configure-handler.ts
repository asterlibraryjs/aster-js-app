import { ServiceScope } from "@aster-js/ioc";
import { IApplicationPartBuilder, IApplicationPart } from "../abstraction";
import { configure, IAppConfigureHandler } from "../abstraction/iapp-configure-handler";
import { HyperlinkNavigationHandler, DefaultRouter, DefaultNavigationHandler, HistoryNavigationHandler } from "../routing";

export class DefaultApplicationConfigureHandler implements IAppConfigureHandler {
    [configure](builder: IApplicationPartBuilder, host?: IApplicationPart | undefined): void {
        builder.configure(x => {
            x.addSingleton(DefaultNavigationHandler, { scope: ServiceScope.container })
                .addSingleton(HistoryNavigationHandler, { scope: ServiceScope.container })
                .addSingleton(HyperlinkNavigationHandler, { scope: ServiceScope.container })
                .addScoped(DefaultRouter);
        });
    }
}
