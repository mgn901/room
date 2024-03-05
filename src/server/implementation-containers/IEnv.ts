export interface IEnv {
  readonly APP_VERSION: string;

  readonly ENTITYREPOSITORY_TYPE: 'mock' | 'prisma';
  readonly PRISMAREPOSITORY_DB_URL: string | undefined;

  readonly HTTP_HOST: string;
  readonly HTTP_PORT: number;
}
