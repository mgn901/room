import { ApplicationErrorOrException } from '../errors/ApplicationErrorOrException.ts';

export class IllegalParamException extends ApplicationErrorOrException {
  public readonly name = 'IllegalParamException';
}
