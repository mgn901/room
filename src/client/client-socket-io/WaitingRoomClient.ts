import { type IClientToServerEventParams } from '../../server/controller-socket-io/socketIoTypes.ts';
import {
  type IWaitingPlayerWithAuthenticationTokenDto,
  type IWaitingRoomWithSecretDto,
} from '../../server/controller/dto.ts';
import { ClientBase, ISnapshot } from './ClientBase.ts';

export class WaitingRoomClient extends ClientBase {
  private _waitingRoom: IWaitingRoomWithSecretDto | undefined;
  public get waitingRoom() {
    return this._waitingRoom;
  }

  private _me: IWaitingPlayerWithAuthenticationTokenDto | undefined;
  public get me() {
    return this._me;
  }

  public constructor(param: ConstructorParameters<typeof ClientBase>[0]) {
    super(param);
    this.socket.on('s:waitingRoom:changed', (param) => {
      this._waitingRoom = { ...param.waitingRoom, secret: this.waitingRoom?.secret! };
      this.dispatchEvent(new Event('update'));
    });
    this.socket.on('s:waitingRoom:deleted', (param) => {
      this._waitingRoom = undefined;
      this._me = undefined;
      this.dispatchEvent(new Event('update'));
    });
  }

  public create() {
    this.socket.emit('c:waitingRoom:create', {});
    this.startProcess();

    this.socket.once('s:waitingRoom:create:ok', (param) => {
      this._waitingRoom = param.waitingRoom;
      this._me = param.waitingPlayer;
      this.finishProcess('s:waitingRoom:create:error');
    });

    this.socket.once('s:waitingRoom:create:error', (param) => {
      this.handleError('s:waitingRoom:create:ok', param);
    });
  }

  public delete(param: IClientToServerEventParams['c:waitingRoom:delete']) {
    this.socket.emit('c:waitingRoom:delete', param);
    this.startProcess();

    this.socket.once('s:waitingRoom:delete:ok', (param) => {
      this._waitingRoom = undefined;
      this._me = undefined;
      this.finishProcess('s:waitingRoom:delete:error');
    });

    this.socket.once('s:waitingRoom:delete:error', (param) => {
      this.handleError('s:waitingRoom:delete:ok', param);
    });
  }

  public join(param: IClientToServerEventParams['c:waitingRoom:players:join']) {
    this.socket.emit('c:waitingRoom:players:join', param);
    this.startProcess();

    this.socket.once('s:waitingRoom:players:join:ok', (param) => {
      this._waitingRoom = param.waitingRoom;
      this._me = param.newPlayer;
      this.finishProcess('s:waitingRoom:players:join:error');
    });

    this.socket.once('s:waitingRoom:players:join:error', (param) => {
      this.handleError('s:waitingRoom:players:join:ok', param);
    });
  }

  public kickPlayer(param: IClientToServerEventParams['c:waitingRoom:players:kick']) {
    this.socket.emit('c:waitingRoom:players:kick', param);
    this.startProcess();

    this.socket.once('s:waitingRoom:players:kick:ok', (param) => {
      this._waitingRoom = { ...param.waitingRoom, secret: this._waitingRoom?.secret! };
      this.finishProcess('s:waitingRoom:players:kick:error');
    });

    this.socket.once('s:waitingRoom:players:kick:error', (param) => {
      this.handleError('s:waitingRoom:players:kick:ok', param);
    });
  }

  public leave(param: IClientToServerEventParams['c:waitingRoom:players:leave']) {
    this.socket.emit('c:waitingRoom:players:leave', param);
    this.startProcess();

    this.socket.once('s:waitingRoom:players:leave:ok', (param) => {
      this._waitingRoom = undefined;
      this._me = undefined;
      this.finishProcess('s:waitingRoom:players:leave:error');
    });

    this.socket.once('s:waitingRoom:players:leave:error', (param) => {
      this.handleError('s:waitingRoom:players:leave:ok', param);
    });
  }

  protected isChanged(snapshot: ISnapshot<this>): boolean {
    return snapshot.me !== this._me || snapshot.waitingRoom !== this._waitingRoom;
  }

  protected createSnapshot(): ISnapshot<this> {
    return {
      ...this,
      create: this.create.bind(this),
      delete: this.delete.bind(this),
      error: this._error,
      isProcessing: this._isProcessing,
      join: this.join.bind(this),
      kickPlayer: this.kickPlayer.bind(this),
      leave: this.leave.bind(this),
      me: this._me,
      waitingRoom: this._waitingRoom,
    };
  }
}
