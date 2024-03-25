import { RouteValue } from "../route-data";

export interface IUrlValueConverter {
    canConvert(value: string): boolean;
    convert(value: string): any;
    convertBack(value: RouteValue | null): string;
}
