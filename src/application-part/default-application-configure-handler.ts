import { ServiceScope } from "@aster-js/ioc";
import { IApplicationPartBuilder, IApplicationPart } from "../abstraction";
import { configure, IAppConfigureHandler } from "../abstraction/iapp-configure-handler";
import { HyperlinkNavigationHandler, DefaultNavigationHandler, HistoryNavigationHandler, DefaultRouteParser } from "../routing";
import { RoutingOptions, defaultRoutingOptions } from "../routing/routing-options";
import { DefaultUrlValueValidatorFactory } from "../routing/url-value-validator/default-url-value-validator-factory";
import { DefaultUrlValueConverterFactory } from "../routing/url-value-converter/default-url-value-converter-factory";
export class DefaultApplicationConfigureHandler implements IAppConfigureHandler {
    [configure](builder: IApplicationPartBuilder, host?: IApplicationPart | undefined): void {
        builder.configure(x => {
            x.addInstance(RoutingOptions, defaultRoutingOptions)
            .addSingleton(DefaultUrlValueConverterFactory)
            .addSingleton(DefaultUrlValueValidatorFactory)
                .addSingleton(DefaultRouteParser)
                .addSingleton(DefaultNavigationHandler, { scope: ServiceScope.container })
                .addSingleton(HistoryNavigationHandler, { scope: ServiceScope.container })
                .addSingleton(HyperlinkNavigationHandler, { scope: ServiceScope.container });
        });
    }
}
