import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fastifyCookie } from '@fastify/cookie';
import { fastifyHelmet } from '@fastify/helmet';
import { fastifyStatic } from '@fastify/static';
import fastify, { type FastifyInstance } from 'fastify';
import { ControllerBase } from '../controller/ControllerBase.ts';
import type { IImplementationContainer } from '../implementation-containers/IImplementationContainer.ts';
import { apiRouteFactory } from './apiRouteFactory.ts';

export class FastifyController extends ControllerBase {
  private readonly fastifyInstance: FastifyInstance;

  public constructor(container: IImplementationContainer) {
    super(container);

    this.fastifyInstance = fastify({ logger: true });
    this.fastifyInstance.register(fastifyHelmet);
    this.fastifyInstance.register(fastifyCookie);

    // `/api`: ルーターがリクエストを処理して返す。
    this.fastifyInstance.register(apiRouteFactory(container), { prefix: '/api' });

    // `/static/*`: `src/client`以下に配置されているものを返す。
    this.fastifyInstance.register(fastifyStatic, {
      root: join(dirname(fileURLToPath(import.meta.url)), '..', 'client'),
      allowedPath(pathName, root, request) {
        return !request.url.match(/^\/static\/index\.html/);
      },
      prefix: '/static',
      etag: true,
      cacheControl: true,
      decorateReply: true,
    });

    // `/`: `src/client/index.html`を返す。
    this.fastifyInstance.get('/', async (req, res) => {
      return res.sendFile('index.html');
    });

    // `/service-worker.js`: `src/client/service-worker.ts`（に対応するjs）を返す。
    this.fastifyInstance.get('/service-worker.js', async (req, res) => {
      return res.sendFile('service-worker.js');
    });

    // `/*`: `src/client/index.html`を返す。
    this.fastifyInstance.get('/*', async (req, res) => {
      return res.sendFile('index.html');
    });

    this.fastifyInstance.setErrorHandler(async (error, req, res) => {
      const { name, message } = error;
      this.fastifyInstance.log.error(`${name} ${message}`);
      return res.status(500).send(error);
    });
  }

  public async start(): Promise<void> {
    await this.fastifyInstance.listen({
      host: this.container.env.HTTP_HOST,
      port: this.container.env.HTTP_PORT,
    });
  }
}
