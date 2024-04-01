import { ServiceIdentifier } from "@aster-js/ioc";

import { IUrlValueConverter } from "./iurl-value-converter";
import { AnySegmentArguments } from "../segment-arguments";

export const IUrlValueConverterFactory = ServiceIdentifier<IUrlValueConverterFactory>({ name: "IUrlValueConverterFactory", namespace: "@aster-js/app", unique: true });

export interface IUrlValueConverterFactory {
    getDefaultConverter(): IUrlValueConverter;
    create(indicator: string, args: AnySegmentArguments): IUrlValueConverter | null;
}
