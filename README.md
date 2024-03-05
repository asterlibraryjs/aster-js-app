# @aster-js/app

```bash
npm install --save @aster-js/app
```

## Main concept

This library has the goal of helping organizing your application services and lifecycles by creating a hierarchy of `ApplicationPart` drived by states declared in `routes`.

![Application Part Schema](./doc/application-part-routing.svg)

## Gets started

To create a basic application, you need to create a new `SinglePageApplication`.

- A `SinglePageApplication` is a built to handle navigations in a dependency injection context.

- A `SinglePageApplication` is also an `IoCContainer` configurable and extensible. See [`@aster-js/ioc`](https://github.com/asterlibraryjs/aster-js-ioc)

### The shortest way

The static `start` method will create an app, configure it through the provided callback or `IAppConfigureHandler`, build it and start it.

```ts
import { SinglePageApplication } from "@aster-js/app";

const app = await SinglePageApplication.start("Library", (builder) => {
    builder.configure(services => services.addSingleton(MyService))
});
```

### The more detailled way

This way will allow to create the application synchronously allowing synchronous references to the app then start it.

```ts
import { SinglePageApplication } from "@aster-js/app";

const builder = SinglePageApplication.create("Library");

builder.configure(services => services.addSingleton(MyService));

export const app =  builder.build();
app.start();
```
> For example, some component based scenarios may require this way to build and start an app. The application may be required then to be exported built from its module and referenced in all components. Then each component can use the `ready` promise to await its loading and render a custom loading UI.

### Child ApplicationPart & IAppConfigureHandler

Even if using a callback to configure a dependency injection container can be a good solution, using an `IAppConfigureHandler` can relocate the code that configure a part of your application more contextual.

```ts
// File: /src/modules/client/configure-client-module.ts
import { IAppConfigureHandler, IApplicationPartBuilder, IApplicationPart } from "@aster-js/app";

export class ConfigureClientModule implements IAppConfigureHandler {
    [configure](builder: IApplicationPartBuilder, host?: IApplicationPart): void {
        // Configure services
    }
}

// File: /src/main.ts
import { SinglePageApplication } from "@aster-js/app";
import { ConfigureClientModule } from "./modules/client";

// Use the "part" route value name to identify where the part is retreived
await SinglePageApplication.start("StoreApp", x => x.addPart("/:part", ConfigureClientModule);
```

### Using ApplicationPartLifecycleHooks

Lifecycle hooks allow you to register automatically methods to execute on important application part lifecycle through the following symbols:

- `ApplicationPartLifecycleHooks.setup`: The first time the module is instanciated.
- `ApplicationPartLifecycleHooks.activated`: When a url match with a part route.
- `ApplicationPartLifecycleHooks.deactivated`: When a route stop matching a part route.

The following example declare a service in charge of loading the settings from a custom service and render them using an other one.
```ts
import { IRouteData, ApplicationPartLifecycleHooks } from "@aster-js/app";
import { IRenderingService, IDataService } from "./services";
import { Setting } from "./models";

export class DefaultSettingService {
    private settings?: Setting[];

    constructor(
        // Container route data gives with url load current part
        @IPartRouteData private readonly routeData: IRouteData,
        // Custom services you have to declare and create
        @IRenderingService private readonly renderer: IRenderingService,
        @IDataService private readonly dataService: IDataService
    ){}

    async [ApplicationPartLifecycleHooks.setup](): Promise<void> {
        const moduleName = this.routeData["module"];
        this.settings = this.dataService.load(moduleName);
    }
    [ApplicationPartLifecycleHooks.activated](): Promise<void> {
        return this.renderer.renderView("settings", { settings: this.settings });
    }
    [ApplicationPartLifecycleHooks.deactivated](): Promise<void> {
        return this.renderer.destroyView("settings");
    }
}
```

> `IPartRouteData` and `IContainerRouteData` are two way to get route data values in services. `Part` for the values that allow the part to load and `Container` for the values that match a route declared during the part loading.

### Nesting parts

The routing allow you to let the remaining part of the url to a child module, this way each module can decide of its own url strategy:
```ts
// File: /src/modules/settings/configure-client-module.ts
import { IAppConfigureHandler, IApplicationPartBuilder, IApplicationPart } from "@aster-js/app";
import { DefaultSettingService } from "./services";

export class ConfigureSettingsModule implements IAppConfigureHandler {
    [configure](builder: IApplicationPartBuilder, host?: IApplicationPart): void {
        builder.configure(x => x.addSingleton(DefaultSettingService));
    }
}

// File: /src/modules/client/configure-client-module.ts
import { IAppConfigureHandler, IApplicationPartBuilder, IApplicationPart } from "@aster-js/app";
import { ConfigureSettingsModule } from "./modules/settings/";

export class ConfigureClientModule implements IAppConfigureHandler {
    [configure](builder: IApplicationPartBuilder, host?: IApplicationPart): void {
        x.addPart("~/:action<settings>", ConfigureSettingsModule) // Put "~/" at the start to match relative urls.
    }
}

// File: /src/main.ts
import { SinglePageApplication } from "@aster-js/app";
import { ConfigureClientModule } from "./modules/client/";

await SinglePageApplication.start("StoreApp", builder => {
    builder.addPart("/:part/*", ConfigureClientModule); // Put "/*" at the end to match url that contains more unhandled parts.
});
```

### Other way to handle navigation
Route handlers are simplified and their is many way to register them. One way is to register an action that will register an `ActionRoutingHandler`:
```ts
import { SinglePageApplication } from "@aster-js/app";

const builder = SinglePageApplication.create("Library");

builder.addAction("/:action", ctx => console.warn(`Action ${ctx.data.values["action"]} called`));

const app =  builder.build();
await app.start();
```

You can also call a service method registering a `ServiceRoutingHandler`:

```ts
import { SinglePageApplication } from "@aster-js/app";
import { IRenderService } from "./services";

const builder = SinglePageApplication.create("Library");

builder.addAction("/:view?index", IRenderService, (svc, data) => svc.render(data.values["view"]));

const app =  builder.build();
await.start();
```

#### Routing options

- Static segments: Segments that never change. A perfect match is expected, ex: `"/static-segment"` // "static-segment" is the static segment
- Route value segments: Start with `:` and the name of the route value, ex: `"/:nameOfTheRouteValue"` // "nameOfTheRouteValue" is the route value name
    - Use regex to validate content like `"/name<^\w$>"`. The regex **must** be surrounded by `^` at start and `$` at the end forcing the validation of the entire string
    - Use `?` to make this segment optional, ex: `"/:nameOfTheRouteValue?"`
    - Add a default value after the `?` optional segments, ex: `"/:nameOfTheRouteValue?12"` // `"12"` is the default value
    - Prefix the variable name with `+` to parse the value as a number, ex: `"/:+nameOfTheRouteValue?12"` // `+12` is the default value and segment has to be valid number to match
    - Prefix the variable name with `!` to parse the value as a boolean, ex: `"/:!option?true"` // `true` is the default value and segment has to be valid number to match
    - Allow string enums this syntax `":value<value1|value2|value3>"` where `"value1"`, `"value1"` and `"value1"` are the only allowed values for the route value named `value`
    - Customise boolean values by providing `<true|false>` as argument like `":!option<ok|no>"` where `"ok"` is `true` and `"no"` is `false`
    - Restrict the range of number using range arguments like this `":!percent<0..100>"`

Then, its easy to create optional static segments using a dynamic enum like this:
```ts
builder.addAction("/:page<index>", _ => console.warn("Action called"));
```

To debug the routing, open the chrome console and watch the logger output of the routing:
```log
[14:03:02.179] [root/CustomerApp] Routing match url "/" with route "/:page?/*"
```

### Declaring your first controller
Controller are a other way to handle routing. Controller use routing result to avoid including rendering code in it.


```ts
// File: ./controllers/customer-view-controller.ts
import { RoutePath, FromSearch, FromRoute } from "@aster-js/app";

export class CustomerViewController {

    @RoutePath("/customers")
    viewAll(@FromSearch("page") page?: string): void {
        console.info(`Show page #${page} of customers`);
    }

    @RoutePath("/customers/detail/:+id")
    viewCustomer(@FromRoute("id") id: number | null): void {
        console.info(`Show detail for customer #${id}`);
    }
}

// File: ./src$main
import { SinglePageApplication } from "@aster-js/app";
import { CustomerViewController } from "../controllers/";

await SinglePageApplication.start("Library", x => x.addController(CustomerViewController));
```

### IRoutingResult

In this case, we are going to use Svelte to render our views so we want to return a IRoutingResult to make this boiler plate code somewhere else:

```ts
// File: ./src/shared/svelte-view-result.ts
import { SinglePageApplication } from "@aster-js/app";

// A class can also be used to implement `IRoutingResult`
export function svelteView(component: Constructor, args: any): IRoutingResult {
    const root = document.getElementById("#root");
    return {
        exec: (app: IApplicationPart) => {
            new component(root, args);
            return Promise.resolve();
        };
    }
}

// File: ./controllers/customer-view-controller.ts
import { RoutePath, FromSearch, FromRoute } from "@aster-js/app";
import { svelteView } from "../shared/svelte-view-result";
import CustomerList from "../views/customer-list.svelte";
import CustomerDetail from "../views/customer-detail.svelte";

export class CustomerViewController {
    @RoutePath("/customers")
    viewAll(@FromSearch("page") page?: string): IRoutingResult {
        return svelteView(CustomerList, { page: page ? +page : 1 })
    }

    @RoutePath("/customers/detail/:+id")
    viewCustomer(@FromRoute("id") id: number | null) {
        if(id === null) return
        return svelteView(CustomerDetail, { id })
    }
}

// File: ./src/main.ts
import { SinglePageApplication } from "@aster-js/app";
import { CustomerViewController } from "../controllers/";

await SinglePageApplication.start("Library", x => x.addController(CustomerViewController));
```

### Controller decorators

- `@RoutePath`: Bind a route to a controller method
- `@FromRoute`: Inject parameter values from the route
- `@FromSearch`: Inject parameter values from comming after the `?`
- `@FromUrl`: Inject any parameter from either the route, either the search

### Controller built-in results

Even if most of real world scenarios will require to implements your custom `IRoutingResult`, these are the provided ones:
- `htmlResult(html: string | HTMLElement, target: HTMLElement, mode?: HtmlInsertionMode)` Will replace of append raw html content into a div. **Warning**: This technic can lead to security risks, use it carefully and never use it with user custom inputs.
- `openResult(url: string, target: string = "_blank", features: OpenWindowOptions = {})` will open a new window, can be usefull for many scenario the must open an url in a separated window.
- `partResult(name: string, configure: Constructor<IAppConfigureHandler> | AppConfigureDelegate)` will load a child application part and activate it.
- `aggregateResults(...results: IRoutingResult[])` will execute sequentially multiple results.
