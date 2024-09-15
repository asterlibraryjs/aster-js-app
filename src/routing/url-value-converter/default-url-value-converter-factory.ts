import { ServiceContract } from "@aster-js/ioc";
import { UrlBooleanValueConverter, UrlNumberValueConverter, UrlStringValueConverter } from "./url-value-converters";
import { IUrlValueConverterFactory } from "./iurl-value-converter-factory";
import { IUrlValueConverter } from "./iurl-value-converter";
import { AnySegmentArguments } from "../segment-arguments";

const STRING_INDICATOR_CHAR = "$";
const NUMBER_INDICATOR_CHAR = "+";
const BOOL_INDICATOR_CHAR = "!";

@ServiceContract(IUrlValueConverterFactory)
export class DefaultUrlValueConverterFactory {
    private readonly _defaultConverter: IUrlValueConverter = new UrlStringValueConverter();
    private readonly _defaultNumberConverter: IUrlValueConverter = new UrlNumberValueConverter();
    private readonly _defaultBooleanConverter: IUrlValueConverter = new UrlBooleanValueConverter("true", "false");

    getDefaultConverter(): IUrlValueConverter {
        return this._defaultConverter;
    }

    create(indicator: string, [argType, ...args]: AnySegmentArguments): IUrlValueConverter | null {
        switch (indicator) {
            case STRING_INDICATOR_CHAR:
                return this._defaultConverter;
            case BOOL_INDICATOR_CHAR:
                if (argType === "enum") {
                    if (args.length !== 2) {
                        throw new Error(`Invalid route format: Only 2 possible values must be provided for booleans <true|false> but provided: ${args.join("|")} `);
                    }
                    return new UrlBooleanValueConverter(args[0], args[1]);
                }
                return this._defaultBooleanConverter;
            case NUMBER_INDICATOR_CHAR:
                return this._defaultNumberConverter;
            default: return null;
        }
    }
}
