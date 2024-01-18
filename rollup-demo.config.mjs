import resolve from "@rollup/plugin-node-resolve";
import multiEntry from "@rollup/plugin-multi-entry";
import sourcemap from "rollup-plugin-sourcemaps";

export default [
    {
        input: ".bin/samples/spa/main.js",
        output: [
            {
                file: "samples/spa/demo.min.js",
                format: "es",
                compact: true,
                sourcemap: true
            }
        ],
        plugins: [
            resolve(),
            multiEntry(),
            sourcemap()
        ]
    }
];
