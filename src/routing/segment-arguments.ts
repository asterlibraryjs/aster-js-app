
export type NoneArguments = [type: "none"];

export type RangeArguments = [type: "range", min: string, max: string];

export type RegexArguments = [type: "regex", regex: string];

export type EnumArguments = [type: "enum", ...values: string[]];

export type SegmentArguments = RangeArguments | RegexArguments | EnumArguments;

export type AnySegmentArguments = SegmentArguments | NoneArguments;

export type SegmentArgumentType = SegmentArguments[0];

export namespace AnySegmentArguments {

    export const OPEN_CHAR = "<";
    export const CLOSE_CHAR = ">";
    const EMPTY_EXPRESSION = "<>";
    const RANGE_EXPRESSION = "..";
    const ENUM_SEPARATOR_CHAR = "|";
    const REGEX_START_CHAR = "^";
    const REGEX_END_CHAR = "$";

    export function parse(expression: string): AnySegmentArguments {
        if(!expression || expression === EMPTY_EXPRESSION) return ["none"];

        if (!expression.startsWith(OPEN_CHAR) || !expression.endsWith(CLOSE_CHAR)) {
            throw new Error("Invalid route format: Segment arguments must be surrounded with '<args>'.");
        }

        const argsExpression = expression.substring(1, expression.length - 1);

        if (argsExpression.indexOf(RANGE_EXPRESSION) !== -1) {
            const [min, max, ...rest] = argsExpression.split("..");

            if (rest.length) throw new Error("Invalid route format: Range dots '..' must only appear once per segment.");

            return ["range", min, max];
        }

        if (argsExpression.startsWith(REGEX_START_CHAR) && argsExpression.endsWith(REGEX_END_CHAR)) {
            return [
                "regex",
                argsExpression
            ];
        }

        const enumValues = argsExpression.split(ENUM_SEPARATOR_CHAR);
        return enumValues.length === 0 ? ["none"] : ["enum", ...enumValues];
    }
}
