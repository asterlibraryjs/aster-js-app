import { ServiceIdentifier } from "@aster-js/ioc";
import { IUrlValueConverter } from "./iurl-value-converter";
import { AnySegmentArguments } from "../segment-arguments";

export const IUrlValueConverterFactory = ServiceIdentifier<IUrlValueConverterFactory>({ name: "@aster-js/app/IUrlValueConverterFactory", unique: true });

export interface IUrlValueConverterFactory {
    getDefaultConverter(): IUrlValueConverter;
    create(indicator: string, args: AnySegmentArguments): IUrlValueConverter | null;
}
