import { type IServerToClientEventParams } from '../../server/controller-socket-io/socketIoTypes.ts';
import { type IDtoOfErrorOrException } from '../../server/controller/dto.ts';
import { type TSocket } from './index.ts';

export abstract class ClientBase extends EventTarget {
  protected readonly socket: TSocket;

  protected _error: IDtoOfErrorOrException | undefined;
  public get error() {
    return this._error;
  }

  protected _isProcessing = false;
  public get isProcessing() {
    return this._isProcessing;
  }

  public constructor(param: { socket: TSocket }) {
    super();
    this.socket = param.socket;
  }

  protected startProcess() {
    this._isProcessing = true;
    this.dispatchEvent(new Event('update'));
  }

  protected finishProcess(canceledErrorName: keyof IServerToClientEventParams & `${string}:error`) {
    this.socket.removeAllListeners(canceledErrorName);
    this._isProcessing = false;
    this.dispatchEvent(new Event('update'));
  }

  protected handleError(
    canceledEventName: keyof IServerToClientEventParams & `${string}:ok`,
    param: IDtoOfErrorOrException,
  ) {
    this._error = param;
    this._isProcessing = false;
    this.dispatchEvent(new Event('error'));
    this.socket.removeAllListeners(canceledEventName);
  }
}
