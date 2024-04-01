import { assert } from "chai";
import { DefaultUrlValueValidatorFactory } from "./default-url-value-validator-factory";
import { AnySegmentArguments } from "../segment-arguments";


describe("DefaultUrlValueValidatorFactory", () => {

    type ValidatorTest = { args: AnySegmentArguments, value: string, expected: boolean };

    const factory = new DefaultUrlValueValidatorFactory();

    ([
        { args: ["range", "1", "2"], value: "1", expected: true },
        { args: ["range", "1", "2"], value: "2", expected: true },
        { args: ["range", "1", "2"], value: "3", expected: false },
        { args: ["range", "1", "2"], value: "0", expected: false },
        { args: ["range", "1", "2"], value: "1.5", expected: true },
        { args: ["range", "1", "2"], value: "1.0", expected: true },
        { args: ["range", "", "2"], value: "0", expected: true },
        { args: ["range", "1", ""], value: "666", expected: true },
        { args: ["range", "", "2"], value: "4", expected: false },
        { args: ["regex", "^[0-9]+$"], value: "123", expected: true },
        { args: ["regex", "^[0-9]+$"], value: "", expected: false },
        { args: ["regex", "^[0-9]+$"], value: "123abc", expected: false },
        { args: ["enum", "1", "2", "3"], value: "1", expected: true },
        { args: ["enum", "1", "2", "3"], value: "2", expected: true },
        { args: ["enum", "1", "2", "3"], value: "3", expected: true },
        { args: ["enum", "1", "2", "3"], value: "4", expected: false },
        { args: ["enum", "1", "2", "3"], value: "", expected: false },
        { args: ["enum", "1", "2", "3"], value: "1.5", expected: false },
        { args: ["enum", "1", "2", "3"], value: "1.0", expected: false },
    ] as ValidatorTest[])
        .forEach(({ args, value, expected }) => {
            it(`Should validate "${value}" with args "${args.join(",")}"`, () => {
                const validator = factory.create(args);

                assert.isDefined(validator, `Validator ${args[0]} is defined`);

                const result = validator!.validate(value);

                assert.equal(result, expected, `Expected ${expected} but got ${result}`);
            });
        });
});
