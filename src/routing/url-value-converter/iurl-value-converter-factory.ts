import { AppServiceId } from "../../abstraction/app-service-id";
import { IUrlValueConverter } from "./iurl-value-converter";
import { AnySegmentArguments } from "../segment-arguments";

export const IUrlValueConverterFactory = AppServiceId<IUrlValueConverterFactory>("IUrlValueConverterFactory");

export interface IUrlValueConverterFactory {
    getDefaultConverter(): IUrlValueConverter;
    create(indicator: string, args: AnySegmentArguments): IUrlValueConverter | null;
}
