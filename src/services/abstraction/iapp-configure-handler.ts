import { IApplicationPart } from "./iapplication-part";
import { IApplicationPartBuilder } from "./iapplication-part-builder";

export interface IAppConfigureHandler {
    configure(builder: IApplicationPartBuilder, host?: IApplicationPart): void;
}
