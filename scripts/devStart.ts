import { createRequire } from 'node:module';
import { context } from 'esbuild';
import { clientBuildOptionsFactory } from './clientBuildOptionsFactory.ts';
import { serverBuildOptionsFactory } from './serverBuildOptionsFactory.ts';

const require = createRequire(import.meta.url);
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const packageJSON = require('../package.json') as unknown as Record<string, any>;

const APP_VERSION = process.env.APP_VERSION ?? (packageJSON.version as string) ?? '1.0.0';

const devStart = async () => {
  const [serverCtx, clientCtx] = await Promise.all([
    context(
      serverBuildOptionsFactory({ appVersion: APP_VERSION, isDev: true, outDir: 'development' }),
    ),
    context(
      clientBuildOptionsFactory({
        appVersion: APP_VERSION,
        isDev: true,
        outDir: 'development',
      }),
    ),
  ]);
  await Promise.all([serverCtx.watch(), clientCtx.watch()]);
  console.info('Watching...');
};

devStart();
