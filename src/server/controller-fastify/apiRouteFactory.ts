import type { FastifyPluginAsync } from 'fastify';
import type { IImplementationContainer } from '../implementation-containers/IImplementationContainer.ts';

export const apiRouteFactory =
  (container: IImplementationContainer): FastifyPluginAsync =>
  async (instance) => {
    instance.addHook('preHandler', (req, res, done) => {
      res.header('cache-control', 'private');
      done();
    });
  };
