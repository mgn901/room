import { env } from 'node:process';
import { config } from 'dotenv';
import type { IEnv } from './IEnv.ts';
import { EnvsMissingException } from './errors/EnvsMissingException.ts';

export class Env implements IEnv {
  public readonly APP_VERSION = process.env.APP_VERSION ?? '1.0.0';

  public readonly ENTITYREPOSITORY_TYPE: 'mock' | 'prisma';
  public readonly PRISMAREPOSITORY_DB_URL: string | undefined;

  public readonly HTTP_HOST: string;
  public readonly HTTP_PORT: number;

  public constructor() {
    const warnings: string[] = ['設定されていない環境変数があります。'];
    const errorMessages: string[] = ['必須の環境変数が設定されていません。'];

    const [ENTITYREPOSITORY_TYPE, PRISMAREPOSITORY_DB_URL, HTTP_HOST, HTTP_PORT] = [
      'ENTITYREPOSITORY_TYPE',
      'PRISMAREPOSITORY_DB_URL',
      'HTTP_HOST',
      'HTTP_PORT',
    ].map((name) => this.getEnv(name));

    // 環境変数の設定状況を確認し、設定されていない場合はエラーメッセージまたは警告メッセージに追加する。
    if (ENTITYREPOSITORY_TYPE !== 'mock' && ENTITYREPOSITORY_TYPE !== 'prisma') {
      warnings.push(
        '  環境変数`ENTITYREPOSITORY_TYPE`が設定されていません。代わりに`mock`が使用されます。',
      );
    }
    if (typeof HTTP_HOST !== 'string') {
      warnings.push(
        '  環境変数`HTTP_HOST`が設定されていません。代わりに`127.0.0.1`が使用されます。',
      );
    }
    if (typeof HTTP_PORT !== 'string') {
      warnings.push('  環境変数`HTTP_PORT`が設定されていません。代わりに`8080`が使用されます。');
    }
    if (ENTITYREPOSITORY_TYPE === 'prisma' && typeof PRISMAREPOSITORY_DB_URL !== 'string') {
      errorMessages.push(
        '  必須の環境変数`PRISMAREPOSITORY_DB_URL`が設定されていません。`ENTITYREPOSITORY_TYPE`が`prisma`である場合は必須です。',
      );
    }

    // 警告またはエラーを出力する。
    if (warnings.length > 1) {
      console.warn(warnings.join('\n'));
    }
    if (errorMessages.length > 1) {
      throw new EnvsMissingException(errorMessages.join('\n'));
    }

    // 環境変数をフィールドに割り当てる。
    this.ENTITYREPOSITORY_TYPE = (ENTITYREPOSITORY_TYPE ?? 'mock') as 'mock';
    this.HTTP_HOST = HTTP_HOST ?? '127.0.0.1';
    this.HTTP_PORT = Number(HTTP_PORT ?? '8080');
  }

  private getEnv(name: string): string | undefined {
    const parsed = config().parsed;
    const fromDotEnv = parsed ? parsed[name] : undefined;
    const fromProcessEnv = env[name];
    if (typeof fromProcessEnv === 'string') {
      return fromProcessEnv;
    }
    if (typeof fromDotEnv === 'string') {
      return fromDotEnv;
    }
    return undefined;
  }
}
