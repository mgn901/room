import { createRequire } from 'node:module';
import path from 'node:path';
import autoprefixer from 'autoprefixer';
import type { BuildOptions } from 'esbuild';
import copyPlugin from 'esbuild-plugin-copy';
import stylePlugin from 'esbuild-style-plugin';
import tailwindcss, { Config } from 'tailwindcss';
import { IBuildOptionsFactoryParams } from './IBuildOptionsFactoryParams';

const require = createRequire(import.meta.url);
const tailwindConfig = require('../tailwind.config.cjs') as unknown as Config;

export const clientBuildOptionsFactory = ({
  isDev,
  outDir,
  appVersion,
}: IBuildOptionsFactoryParams): BuildOptions => ({
  entryPoints: [
    path.join('src', 'client', 'index.tsx'),
    // path.join('src', 'client', 'serviceWorker.ts'),
  ],
  outdir: path.join(outDir, 'client'),
  assetNames: 'assets/[name]',
  chunkNames: '[name]',
  loader: {
    '.woff': 'file',
    '.woff2': 'file',
  },
  platform: 'browser',
  format: 'iife',
  bundle: true,
  define: {
    'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
    'process.env.APP_VERSION': JSON.stringify(appVersion),
  },
  minify: !isDev,
  sourcemap: isDev,
  target: ['chrome98', 'firefox97', 'edge98', 'safari14'],
  plugins: [
    stylePlugin({
      postcss: {
        plugins: [tailwindcss(tailwindConfig), autoprefixer()],
      },
    }),
    copyPlugin({
      assets: {
        from: 'src/client/static/**/*',
        to: '.',
      },
      copyOnStart: true,
      watch: true,
      verbose: true,
    }),
  ],
});
