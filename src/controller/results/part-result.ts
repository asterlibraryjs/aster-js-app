import { AppConfigureType, IApplicationPart } from "../../abstraction";
import { IRoutingResult } from "../irouting-result";


export function partResult(name: string, configure: AppConfigureType): IRoutingResult {
    return new PartResult(name, configure);
}

class PartResult implements IRoutingResult {

    constructor(
        private readonly _name: string,
        private readonly _configure: AppConfigureType
    ) {    }

    async exec(app: IApplicationPart): Promise<void> {
        await app.load(this._name, this._configure);
    }
}
