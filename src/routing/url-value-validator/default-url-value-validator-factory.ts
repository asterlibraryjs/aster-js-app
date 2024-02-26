import { ServiceContract } from "@aster-js/ioc";
import { AnySegmentArguments } from "../segment-arguments";
import { IUrlValueValidator, IUrlValueValidatorFactory } from "./iurl-value-validator";
import { UrlEnumValidator, UrlRangeValidator, UrlRegexValidator } from "./url-value-validators";

const STRING_INDICATOR_CHAR = "$";
const NUMBER_INDICATOR_CHAR = "+";
const BOOL_INDICATOR_CHAR = "!";

@ServiceContract(IUrlValueValidatorFactory)
export class DefaultUrlValueValidatorFactory {

    create(args: AnySegmentArguments): IUrlValueValidator | null {
        switch (args[0]) {
            case "range":
                return new UrlRangeValidator(args);
            case "regex":
                return new UrlRegexValidator(args);
            case "enum":
                return new UrlEnumValidator(args);
            default:
                return null;
        }
    }
}
