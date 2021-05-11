import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import postcss from "rollup-plugin-postcss";

import pkg from './package.json'

export default {
  input: pkg.src,
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
      strict: false
    },
    {
      file: pkg.module,
      format: 'esm',
      exports: 'named',
      sourcemap: true,
      strict: false
    }
  ],
  plugins: [
    postcss({
      modules: {
        generateScopedName: "[local]___[hash:base64:5]"
      },
    }),
    peerDepsExternal(),
    typescript(),
    resolve(),
    commonjs(),
  ],
  external: ['react', 'react-dom']
}