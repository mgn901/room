import { type IServerToClientEventParams } from '../../server/controller-socket-io/socketIoTypes.ts';
import { type IDtoOfErrorOrException } from '../../server/controller/dto.ts';
import { type TSocket } from './index.ts';

export type ISnapshot<C extends ClientBase> = Omit<C, keyof EventTarget | 'getSnapshot'>;

export abstract class ClientBase extends EventTarget {
  protected readonly socket: TSocket;

  protected snapshot: ISnapshot<this> | undefined;

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
    this._error = undefined;
    this.dispatchEvent(new Event('update'));
  }

  protected finishProcess(canceledErrorName: keyof IServerToClientEventParams & `${string}:error`) {
    this._isProcessing = false;
    this.dispatchEvent(new Event('update'));
    this.socket.removeAllListeners(canceledErrorName);
  }

  protected handleError(
    canceledEventName: keyof IServerToClientEventParams & `${string}:ok`,
    param: IDtoOfErrorOrException,
  ) {
    this._isProcessing = false;
    this._error = param;
    this.dispatchEvent(new Event('update'));
    this.socket.removeAllListeners(canceledEventName);
  }

  protected abstract isChanged(snapshot: ISnapshot<this>): boolean;

  protected abstract createSnapshot(): ISnapshot<this>;

  public getSnapshot(): ISnapshot<this> {
    if (this.snapshot === undefined) {
      this.snapshot = this.createSnapshot();
    }
    if (
      this.snapshot.error !== this._error ||
      this.snapshot.isProcessing !== this._isProcessing ||
      this.isChanged(this.snapshot)
    ) {
      this.snapshot = this.createSnapshot();
    }
    return this.snapshot;
  }
}
