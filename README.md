# @aster-js/app

```bash
npm install --save @aster-js/app
```

## Main concept

This library has the goal of helping organizing your application services and lifecycles by creating a hierarchy of `ApplicationPart` drived by `routes`.

![Alt text](./doc/application-part-routing.svg)

## Gets started

To create a basic application, you need to create a new `SinglePageApplication`.

### The shortest way
```ts
const app = await SinglePageApplication.start("Library", (builder) => {
    builder.configure(services => services.addSingleton(MyService))
});
```

### The more detailled way
```ts
const builder = SinglePageApplication.create("Library");

builder.configure(services => services.addSingleton(MyService));

const app =  builder.build();
await.start();
```

### Declaring your first route handler
```ts
const builder = SinglePageApplication.create("Library");

builder.addAction("/my-action", _ => console.warn("Action called"));

const app =  builder.build();
await.start();
```

#### Routing options

- Static segments: Segments that never change. A perfect match is expected, ex: `/static-segment` // "static-segment" is the static segment
- Route value segments: Start with `:` and the name of the route value, ex: `/:nameOfTheRouteValue` // "nameOfTheRouteValue" is the route value name
    - Use `?` to make this segment optional, ex: `/:nameOfTheRouteValue?`
    - Add a default value after the `?` optional segments, ex: `/:nameOfTheRouteValue?12` // "12" is the default value
    - Prefix the variable name with `+` to parse the value as a number, ex: `/:+nameOfTheRouteValue?12` // +12 is the default value and segment has to be valid number to match
    - Allow string enums this syntax `:value<value1|value2|value3>` where `value1`, `value1` and `value1` are the only allowed values for the route value named `value`

Then, its easy to create optional static segments using a dynamic enum like this:
```ts
builder.addAction("/:page<index>", _ => console.warn("Action called"));
```

To debug the routing, open the chrome console and watch the logger output of the routing:
```log
[14:03:02.179] [root/CustomerApp] Routing match url "/" with route "/:page/*"
```

### Declaring your first controller
```ts

export class CustomViewController() {
    @RoutePath("/")
    getAll()
}


const builder = SinglePageApplication.create("Library");

builder.addController("/my-action", _ => console.warn("Action called"));

const app =  builder.build();
await.start();
```
