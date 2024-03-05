import { Env } from './Env.node.ts';
// const { PrismaClient } = await import('../prisma-client');

export class ImplementationContainer {
  public readonly env: Env;

  public constructor() {
    this.env = new Env();

    if (this.env.ENTITYREPOSITORY_TYPE === 'mock') {
    } else {
      // const prisma = new PrismaClient();
    }
  }
}
