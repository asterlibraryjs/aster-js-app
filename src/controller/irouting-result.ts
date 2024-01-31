import { IApplicationPart } from "../abstraction";

/** Implementation used by controllers to encapsulate generic logic and isole functional implementation from rendering */
export interface IRoutingResult {
    exec(app: IApplicationPart): Promise<void>;
}
