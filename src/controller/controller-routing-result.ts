import type { IRoutingResult } from "./irouting-result";
import type { IApplicationPart } from "../abstraction";
import { AsyncResultStream } from "../Utils/async-result-stream";

/** Represents all possible results from a controller route invocation */
export type ControllerRoutingResult = IRoutingResult
    | Iterable<IRoutingResult>
    | AsyncIterable<IRoutingResult>
    | Promise<IRoutingResult>;

export namespace ControllerRoutingResult {
    /** Execute the ControllerRoutingResult returned by a  */
    export async function exec(result: ControllerRoutingResult | null | undefined, app: IApplicationPart): Promise<void> {
        const stream = new AsyncResultStream<IRoutingResult>(result)
        for await (const item of stream) {
            await item.exec(app);
        }
    }
}