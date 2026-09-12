import dts from "rollup-plugin-dts";

const config = [
  {
    input: "build/es6/loopr.js",
    external: ["@1pizzateam/spock", "@dwtechs/checkard"],
    output: {
      file: "build/loopr.mjs",
      format: "es",
      generatedCode: "es2015",
    },
  },
  {
    input: "build/es6/loopr.d.ts",
    output: {
      file: "build/loopr.d.mts",
      format: "es",
    },
    plugins: [dts()],
  },
];

export default config;
