import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import { eslint } from 'rollup-plugin-eslint';
import babel from 'rollup-plugin-babel';

const production = !process.env.ROLLUP_WATCH;

const lr = !production && livereload('../../mjvartorg/public/js/');
function generateConfig(baseName) {
  return {
    input: `src/${baseName}/main.js`,
    output: {
      sourcemap: true,
      format: 'iife',
      name: 'app',
      file: `../../mjvartorg/public/js/${baseName}/bundle.js`,
    },
    plugins: [
      eslint({
        include: [
          'src/**/*.svelte',
          'src/**/*.js',
          'src/**/*.mjs',
        ],
      }),
      svelte({
        dev: !production,
        css: (css) => {
          css.write(`../../mjvartorg/public/js/${baseName}/bundle.css`);
        },
      }),
      resolve({
        browser: true,
        dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/'),
      }),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
      }),

      // Watch the `public` directory and refresh the
      // browser on changes when not in production
      // !production && livereload(`../../mjvartorg/public/js/${baseName}`),
      !production && lr,

      // If we're building for production (npm run build
      // instead of npm run dev), minify
      production && terser(),
    ],
    watch: {
      clearScreen: false,
    },
  };
}

export default [
  generateConfig('chat'),
  generateConfig('post-comments'),
  generateConfig('messages'),
];
