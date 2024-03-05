import { createRequire } from 'node:module';
import esbuild from 'esbuild';
import { clientBuildOptionsFactory } from './clientBuildOptionsFactory';
import { serverBuildOptionsFactory } from './serverBuildOptionsFactory.ts';

const require = createRequire(import.meta.url);
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const packageJSON = require('../package.json') as unknown as Record<string, any>;

const APP_VERSION = process.env.APP_VERSION ?? (packageJSON.version as string) ?? '1.0.0';

const prodBuild = async () => {
  esbuild.build(
    clientBuildOptionsFactory({
      appVersion: APP_VERSION,
      isDev: false,
      outDir: 'production',
    }),
  );
  esbuild.build(
    serverBuildOptionsFactory({
      appVersion: APP_VERSION,
      isDev: false,
      outDir: 'production',
    }),
  );
};

prodBuild();
