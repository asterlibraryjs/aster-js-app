import { Many, ServiceContract } from "@aster-js/ioc";
import { IRoutingTable } from "./irouting-table";
import { Route } from "./route";
import { IRoutingHandler } from "./irouting-handler";
import { IRouteParser } from "./iroute-parser";

@ServiceContract(IRoutingTable)
export class DefaultRoutingTable implements IRoutingTable {
    private readonly _handlers: (readonly [Route, IRoutingHandler])[];

    constructor(
        @IRouteParser parser: IRouteParser,
        @Many(IRoutingHandler) handlers: IRoutingHandler[]
    ) {
        this._handlers = handlers.map(x => [new Route(parser.parse(x.path)), x] as const);
    }

    *getPaths(): Iterable<string> {
        for (const [, handler] of this._handlers) {
            yield handler.path;
        }
    }

    *getHandlers(): Iterable<readonly [Route, IRoutingHandler]> {
        yield* this._handlers;
    }
}
