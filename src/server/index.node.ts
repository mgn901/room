import { FastifyController } from './controller-fastify/FastifyController.ts';
import { ImplementationContainer } from './implementation-containers/ImplementationContainer.node.ts';

export const start = async () => {
  const container = new ImplementationContainer();
  const controller = new FastifyController(container);
  await controller.start();
};

start();
