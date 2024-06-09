import { RouteValue } from "../route-data/route-values";

export interface IUrlValueConverter {
    canConvert(value: string): boolean;
    convert(value: string): any;
    convertBack(value: RouteValue | null): string;
}
