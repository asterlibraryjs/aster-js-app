import { ServiceIdentifier } from "@aster-js/ioc";


export function AppServiceId<T>(name: string): ServiceIdentifier<T> {
    return ServiceIdentifier<T>({ name, namespace: "@aster-js/app", unique: true });
}
