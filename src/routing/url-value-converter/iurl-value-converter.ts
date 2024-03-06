import { RouteValue } from "../routing-invocation-context";

export interface IUrlValueConverter {
    canConvert(value: string): boolean;
    convert(value: string): any;
    convertBack(value: RouteValue | null): string;
}
