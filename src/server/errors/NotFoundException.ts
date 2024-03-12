import { ServerErrorOrException } from './ServerErrorOrException.ts';

export class NotFoundException extends ServerErrorOrException {
  public readonly name = 'NotFoundException';
}
