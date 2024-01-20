import { SinglePageApplication } from "../../src"
import { DefaultRendererService, IRendererService } from "./services/renderer-service";

export default SinglePageApplication.start("Library", (builder) => {
    builder.configure(x => x.addSingleton(DefaultRendererService));

    builder.addAction<IRendererService>(
        "/:bob/*",
        IRendererService,
        (renderer, data) => renderer.render(`Bob is equal to: ${data.values["bob"]}`)
    );
});
