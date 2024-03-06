import { ServiceIdentifier } from "@aster-js/ioc";
import { AnySegmentArguments } from "../segment-arguments";

export const IUrlValueValidatorFactory = ServiceIdentifier<IUrlValueValidatorFactory>({ name: "@aster-js/app/IUrlValueValidatorFactory", unique: true });

export interface IUrlValueValidatorFactory {
    create(args: AnySegmentArguments): IUrlValueValidator | null;
}

export interface IUrlValueValidator {
    validate(value: string): boolean;
}
