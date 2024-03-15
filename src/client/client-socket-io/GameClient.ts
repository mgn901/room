import { type IClientToServerEventParams } from '../../server/controller-socket-io/socketIoTypes.ts';
import { type IGameDto } from '../../server/controller/dto.ts';
import { ClientBase, ISnapshot } from './ClientBase.ts';

export class GameClient extends ClientBase {
  private _game: IGameDto | undefined;
  public get game() {
    return this._game;
  }

  public constructor(param: ConstructorParameters<typeof ClientBase>[0]) {
    super(param);
    this.socket.on('s:game:changed', (param) => {
      this._game = param.game;
      this.dispatchEvent(new Event('update'));
    });
  }

  public create(param: IClientToServerEventParams['c:game:create']) {
    this.socket.emit('c:game:create', param);
    this.startProcess();

    this.socket.once('s:game:create:ok', (param) => {
      this._game = param.game;
      this.finishProcess('s:game:create:error');
    });

    this.socket.once('s:game:create:error', (param) => {
      this.handleError('s:game:create:ok', param);
    });
  }

  public changeTurn(param: IClientToServerEventParams['c:game:changeTurn']) {
    this.socket.emit('c:game:changeTurn', param);
    this.startProcess();

    this.socket.once('s:game:changeTurn:ok', (param) => {
      this._game = param.game;
      this.finishProcess('s:game:changeTurn:error');
    });

    this.socket.once('s:game:changeTurn:error', (param) => {
      this.handleError('s:game:changeTurn:ok', param);
    });
  }

  protected isChanged(snapshot: ISnapshot<this>): boolean {
    return snapshot.game !== this._game;
  }

  protected createSnapshot(): ISnapshot<this> {
    return {
      ...this,
      changeTurn: this.changeTurn.bind(this),
      create: this.create.bind(this),
      error: this._error,
      game: this._game,
      isProcessing: this._isProcessing,
    };
  }
}
