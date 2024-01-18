import { ServiceContract, ServiceIdentifier } from "@aster-js/ioc";

export const IRendererService = ServiceIdentifier<IRendererService>("IRendererService");

export interface IRendererService {
    render(data: string): void;
}

@ServiceContract(IRendererService)
export class DefaultRendererService implements IRendererService {
    render(data: string): void {
        const div = document.createElement("div");
        div.innerText = data;
        document.body.appendChild(div);
    }
}
