import { AppServiceId } from "../../abstraction/app-service-id";
import { AnySegmentArguments } from "../segment-arguments";

export const IUrlValueValidatorFactory = AppServiceId<IUrlValueValidatorFactory>("IUrlValueValidatorFactory");

export interface IUrlValueValidatorFactory {
    create(args: AnySegmentArguments): IUrlValueValidator | null;
}

export interface IUrlValueValidator {
    validate(value: string): boolean;
    toRouteString(): string;
}
