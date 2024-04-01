/** Value types that can be transform into an url */
export type RouteValue = string | number | boolean | Date;

/** Values extracted from the url path by a matching route */
export type RouteValues = Record<string, RouteValue>;
