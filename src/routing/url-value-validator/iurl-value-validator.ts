import { ServiceIdentifier } from "@aster-js/ioc";
import { AnySegmentArguments } from "../segment-arguments";

export const IUrlValueValidatorFactory = ServiceIdentifier<IUrlValueValidatorFactory>("IUrlValueValidatorFactory");

export interface IUrlValueValidatorFactory {
    create(args: AnySegmentArguments): IUrlValueValidator | null;
}

export interface IUrlValueValidator {
    validate(value: string): boolean;
}

export namespace IUrlValueValidator {

}
