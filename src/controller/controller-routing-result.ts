import type { IRoutingResult } from "./irouting-result";
import type { IApplicationPart } from "../abstraction";

export type ControllerRoutingResult = IRoutingResult
    | Iterable<IRoutingResult>
    | AsyncIterable<IRoutingResult>
    | Promise<IRoutingResult>;

export namespace ControllerRoutingResult {
    /** Execute the ControllerRoutingResult returned by a  */
    export async function exec(result: ControllerRoutingResult | null | undefined, app: IApplicationPart): Promise<void> {
        if (result instanceof Promise) {
            result = await result;
        }

        if (!result) return;

        if (Reflect.has(result, Symbol.iterator)) {
            await execIterable(<Iterable<IRoutingResult>>result, app);
            return;
        }

        if (Reflect.has(result, Symbol.asyncIterator)) {
            await execAsyncIterable(<AsyncIterable<IRoutingResult>>result, app);
            return;
        }

        await execResult(<IRoutingResult>result, app);
    }

    async function execIterable(results: Iterable<IRoutingResult>, app: IApplicationPart): Promise<void> {
        for (const result of results) {
            await execResult(result, app);
        }
    }

    async function execAsyncIterable(results: AsyncIterable<IRoutingResult>, app: IApplicationPart): Promise<void> {
        for await (const result of results) {
            await execResult(result, app);
        }
    }

    function execResult(result: IRoutingResult, app: IApplicationPart): Promise<void> {
        return result.exec(app);
    }
}