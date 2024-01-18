import { ServiceScope } from "@aster-js/ioc";
import { IApplicationPartBuilder, IApplicationPart } from "../abstraction";
import { IAppConfigureHandler } from "../abstraction/iapp-configure-handler";
import { HyperlinkNavigationHandler, DefaultRouter } from "../routing";

export class DefaultApplicationConfigureHandler implements IAppConfigureHandler{
    configure(builder: IApplicationPartBuilder, host?: IApplicationPart | undefined): void {
        builder.configure(x => {
            x.addSingleton(HyperlinkNavigationHandler, { scope: ServiceScope.container })
                .addScoped(DefaultRouter);
        });
    }
}
