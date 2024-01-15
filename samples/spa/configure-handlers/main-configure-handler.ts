import { IAppConfigureHandler, IApplicationPartBuilder } from "../../../src";
import { DataService } from "../services/data-service";

export class MainConfigureHandler implements IAppConfigureHandler {
    configure(builder: IApplicationPartBuilder): void {
        builder.configure(x => x.addSingleton(DataService));
        builder.addAction("/{bob}", x => alert(x));
    }
}
