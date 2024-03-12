import { ApplicationErrorOrException } from './ApplicationErrorOrException.ts';

export class IllegalContextException extends ApplicationErrorOrException {
  public readonly name = 'IllegalContextException';
}
