import {
    IAppConfigureHandler,
    IApplicationPart,
    IApplicationPartBuilder,
    SinglePageApplication,
    configure,
    IAppConfigureMiddleware,NextAppConfigureMiddlewareCallback,
    RoutePath
} from "../../src"
import { DefaultRendererService, IRendererService } from "./services/renderer-service";
import { IDisposable } from "@aster-js/core";
import { htmlView, HtmlViewSlot } from "../../src/rendering/html/html-slot-content";
import { IView, IViewSlot, ViewLayout, ViewRoutingResult, ViewRoutingResultDelegate } from "../../src/rendering";

export default SinglePageApplication.start("Library", (builder) => {
    builder.configure(x => x.addSingleton(DefaultRendererService));

    builder.addAction<IRendererService>(
        "/:view/*",
        IRendererService,
        (renderer, data) => renderer.render(`Selected view: ${data.values["view"]}`)
    );
});

