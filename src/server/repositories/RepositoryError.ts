import { ServerErrorOrException } from '../errors/ServerErrorOrException.ts';

export class RepositoryError extends ServerErrorOrException {
  public readonly name = 'RepositoryError';
}
