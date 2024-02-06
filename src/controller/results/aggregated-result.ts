import { IApplicationPart } from "../../abstraction";
import { IRoutingResult } from "../irouting-result";

/**
 * Aggregates multiple results into one
 * @param results Results to aggregate
 */
export function aggregateResults(...results: IRoutingResult[]): IRoutingResult {
    return new AggregatedResult(results);
}

class AggregatedResult implements IRoutingResult {

    constructor(
        private readonly _results: IRoutingResult[]
    ) {

    }

    async exec(_app: IApplicationPart): Promise<void> {
        for (const result of this._results) {
            await result.exec(_app);
        }
    }
}
