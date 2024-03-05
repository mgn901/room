import path from 'node:path';
import { BuildOptions } from 'esbuild';
import { IBuildOptionsFactoryParams } from './IBuildOptionsFactoryParams.ts';

export const serverBuildOptionsFactory = ({
  isDev,
  outDir,
  appVersion,
}: IBuildOptionsFactoryParams): BuildOptions => ({
  loader: {
    '.html': 'file',
  },
  entryPoints: [path.join('src', 'server', 'index.node.ts')],
  outdir: path.join(outDir, 'server'),
  platform: 'node',
  format: 'esm',
  bundle: true,
  define: {
    'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
    'process.env.APP_VERSION': JSON.stringify(appVersion),
  },
  minify: !isDev,
  sourcemap: isDev,
  target: ['node18'],
  external: ['bcrypt'],
  banner: {
    js: `const require=(await import("node:module")).createRequire(import.meta.url);const __filename=(await import("node:url")).fileURLToPath(import.meta.url);const __dirname=(await import("node:path")).dirname(__filename);`,
  },
});
