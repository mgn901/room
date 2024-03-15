import { type IClientToServerEventParams } from '../../server/controller-socket-io/socketIoTypes.ts';
import { type IPlayerDto } from '../../server/controller/dto.ts';
import { ClientBase, ISnapshot } from './ClientBase.ts';

export class PlayerClient extends ClientBase {
  private _players = new Map<IPlayerDto['id'], IPlayerDto>();
  public get players() {
    return this._players;
  }

  private _me: IPlayerDto | undefined;
  public get me() {
    return this._me;
  }

  public constructor(param: ConstructorParameters<typeof ClientBase>[0]) {
    super(param);
    this.socket.on('s:player:changed', (param) => {
      this._players.set(param.player.id, param.player);
      this.dispatchEvent(new Event('update'));
    });
  }

  public proceedAction(param: IClientToServerEventParams['c:player:proceedAction']) {
    this.socket.emit('c:player:proceedAction', param);
    this.startProcess();

    this.socket.once('s:player:proceedAction:ok', (param) => {
      this._me = param.me;
      this.finishProcess('s:player:proceedAction:error');
    });

    this.socket.once('s:player:proceedAction:error', (param) => {
      this.handleError('s:player:proceedAction:ok', param);
    });
  }

  public discard(param: IClientToServerEventParams['c:player:discard']) {
    this.socket.emit('c:player:discard', param);
    this.startProcess();

    this.socket.once('s:player:discard:ok', (param) => {
      this._me = param.player;
      this.finishProcess('s:player:discard:error');
    });

    this.socket.once('s:player:discard:error', (param) => {
      this.handleError('s:player:discard:ok', param);
    });
  }

  protected isChanged(snapshot: ISnapshot<this>): boolean {
    return (
      snapshot.me !== this._me ||
      [...snapshot.players.values()].some((player) => player !== this._players.get(player.id))
    );
  }

  protected createSnapshot(): ISnapshot<this> {
    return {
      ...this,
      discard: this.discard.bind(this),
      error: this._error,
      isProcessing: this._isProcessing,
      me: this._me,
      players: this._players,
      proceedAction: this.proceedAction.bind(this),
    };
  }
}
