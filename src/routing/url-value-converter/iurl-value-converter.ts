import { TypeOfResult } from "@aster-js/core";
import { RouteValue } from "../route-data/route-values";

export interface IUrlValueConverter {
    readonly targetType: TypeOfResult;
    canConvert(value: string): boolean;
    convert(value: string): any;
    convertBack(value: RouteValue | null): string;
}
