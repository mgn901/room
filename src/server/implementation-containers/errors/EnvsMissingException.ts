import { ServerErrorOrException } from '../../errors/ServerErrorOrException.ts';

export class EnvsMissingException extends ServerErrorOrException {
  public readonly name = 'EnvsMissingException';
}
