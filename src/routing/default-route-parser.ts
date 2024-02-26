import { IRouteParser } from "./iroute-parser";
import { IRouteSegment } from "./iroute-segment";
import { Path } from "./path";
import { WildcardRouteSegment, RelativeRouteSegment, StaticRouteSegment } from "./route-segments";
import { IUrlValueConverter, IUrlValueConverterFactory } from "./url-value-converter";
import { RouteValueValidator, ValueRouteSegment } from "./route-segments/value-route-segment";
import { ServiceContract } from "@aster-js/ioc";
import { Query } from "@aster-js/iterators";
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
     * - /:name<one|two|three>?one/
     * - /:!condition<true|false>?true/
     * - /:!condition<yes|no>?yes/
     * - /:+size<..50>?44/
     * - /:+page<1..>?1/
     * - /:+page<1..100>?1/
     * - /:$name<111..22>/
     * - /:name<111..22>?111/
     * - /:name<^[\w]$>?111/
     */
    parseDynamicSegment(segment: string): IRouteSegment {
        const chars = [...segment];
        const q = Query([...segment]);

        let nameExpression = [...q.takeWhile(x => x !== NULLABLE_CHAR && x !== AnySegmentArguments.OPEN_CHAR)].join("");

        let nullableIdx = chars.lastIndexOf(NULLABLE_CHAR);
        const argsEnd = chars.lastIndexOf(AnySegmentArguments.CLOSE_CHAR);
        if(argsEnd !== -1 && argsEnd > nullableIdx) {
            nullableIdx = -1;
        }
        let defaultExpression = nullableIdx !== -1 ? [...q.skipWhile((_, idx) => idx < nullableIdx)].join("") : "";

        let optional = false;
        let defaultValue: RouteValue | null = null;

        const argsExpression = segment.substring(nameExpression.length, nullableIdx !== -1 ? nullableIdx : segment.length);
        const args = AnySegmentArguments.parse(argsExpression);
        const validator = this._validatorFactory.create(args);

        // Resolve converter and remove type indicator
        const indicator = nameExpression.charAt(0);
        let converter = this._converterFactory.create(indicator, args);
        if (converter !== null) {
            nameExpression = nameExpression.substring(1);
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

        return new ValueRouteSegment(nameExpression, optional, defaultValue, converter, validator);
    }
}
