import { ServiceContract, ServiceIdentifier } from "@aster-js/ioc";

export const IRendererService = ServiceIdentifier<IRendererService>("IRendererService");

export interface IRendererService {
    render(data: string): void;
}

@ServiceContract(IRendererService)
export class DefaultRendererService implements IRendererService {
    render(data: string): void {
        const actual = document.body.querySelector("#default-renderer-output");
        if (actual) actual.remove();

        const div = document.createElement("div");
        div.innerText = data;
        div.id = "default-renderer-output"
        document.body.appendChild(div);
    }
}
