import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/main.ts',
	output: {
		file: 'public/bundle.js',
		format: 'iife',
		sourcemap: true
	},
	external: ['bootstrap'],
	plugins: [
		resolve(),
		commonjs(), 
		typescript(),
		production && terser() // minify, but only in production
	]
};
