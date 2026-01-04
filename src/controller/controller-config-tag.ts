import { Tag } from "@aster-js/core";

export const ControllerConfigTag = Tag<ControllerConfig>("config");

export type ControllerConfig = {
    readonly baseRoute?: string;
};
