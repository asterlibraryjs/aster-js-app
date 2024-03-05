import { IRouteParser } from "./iroute-parser";
import { IRouteSegment } from "./iroute-segment";
import { Path } from "./path";
import { WildcardRouteSegment, RelativeRouteSegment, StaticRouteSegment } from "./route-segments";
import { IUrlValueConverterFactory } from "./url-value-converter";
import { ValueRouteSegment } from "./route-segments/value-route-segment";
import { ServiceContract } from "@aster-js/ioc";
import { RouteValue } from "./routing-invocation-context";
import { asserts } from "@aster-js/core";
import { AnySegmentArguments, SegmentArguments } from "./segment-arguments";
import { IUrlValueValidatorFactory } from "./url-value-validator/iurl-value-validator";

const ASSIGN_CHAR = ":";
const NULLABLE_CHAR = "?";

@ServiceContract(IRouteParser)
export class DefaultRouteParser implements IRouteParser {

    constructor(
        @IUrlValueConverterFactory private readonly _converterFactory: IUrlValueConverterFactory,
        @IUrlValueValidatorFactory private readonly _validatorFactory: IUrlValueValidatorFactory
    ) { }

    * parse(route: string): Iterable<IRouteSegment> {
        if (Path.isEmpty(route)) return;

        const path = Path.parse(route);

        for (let i = 0; i < path.length; i++) {
            const segment = path.getAt(i);
            asserts.defined(segment);

            if (RelativeRouteSegment.isRelative(segment)) {
                if (i !== 0) {
                    throw new Error(`Relative symbol "${segment}" can only appear at index 0 but appear at ${i} in route "${route}"`);
                }

                yield RelativeRouteSegment.instance;
            }

            else if (WildcardRouteSegment.isWildcard(segment)) {
                if ((i + 1) < path.length) {
                    throw new Error("Wildcard segment must be the last segment in the route");
                }
                yield WildcardRouteSegment.instance;
            }

            else if (segment.startsWith(ASSIGN_CHAR)) {
                yield this.parseDynamicSegment(segment.substring(1));
            }

            else {
                yield new StaticRouteSegment(segment);
            }
        }
    }

    /**
     * Currently supported dynamic segment formats:
     * - String Enum: /:name<one|two|three>?one/
     * - Boolean:
     *      - /:!condition<true|false>?true/
     *      - /:!condition<yes|no>?yes/
     * - Number with optional range:
     *      - /:+size<..50>?44/
     *      - /:+page<1..>?1/
     *      - /:+page<1..100>?1/
     * - Regex on any type: /:name<^[\w]$>?111/
     */
    protected parseDynamicSegment(segment: string): IRouteSegment {
        let argsExpression = "";
        let defaultExpression = "";

        let optional = false;
        let defaultValue: RouteValue | null = null;

        const argsIdx = segment.indexOf(AnySegmentArguments.OPEN_CHAR);
        let nullableIdx = segment.lastIndexOf(NULLABLE_CHAR);

        const nameEndIdx = argsIdx !== -1 ? argsIdx : nullableIdx !== -1 ? nullableIdx : -1;
        let name = nameEndIdx === -1 ? segment : segment.substring(0, nameEndIdx);

        const argsEndIdx = segment.lastIndexOf(AnySegmentArguments.CLOSE_CHAR);
        if (argsIdx !== -1) {
            if (argsEndIdx === -1) throw new Error("Invalid route format: Segment arguments must be surrounded with '<args>', closing one missing.");
            argsExpression = segment.substring(argsIdx, argsEndIdx + 1);
        }
        else if (argsEndIdx !== -1) {
            throw new Error("Invalid route format: Segment arguments must be surrounded with '<args>', opening one missing.");
        }

        if (nullableIdx !== -1 && nullableIdx > argsEndIdx) {
            defaultExpression = segment.slice(nullableIdx);
        }

        const args = AnySegmentArguments.parse(argsExpression);
        const validator = this._validatorFactory.create(args);

        // Resolve converter and remove type indicator
        const indicator = name.charAt(0);
        let converter = this._converterFactory.create(indicator, args);
        if (converter !== null) {
            name = name.substring(1);
        }
        else {
            converter = this._converterFactory.getDefaultConverter();
        }

        // Nullable will occur after validator
        if (defaultExpression) {
            optional = true;
            if (defaultExpression !== NULLABLE_CHAR) {
                defaultValue = converter.convert(defaultExpression.substring(1));
            }
        }

        return new ValueRouteSegment(name, optional, defaultValue, converter, validator);
    }
}
