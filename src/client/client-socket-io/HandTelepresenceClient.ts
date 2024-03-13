import { type IClientToServerEventParams } from '../../server/controller-socket-io/socketIoTypes.ts';
import {
  type IHandTelepresenceDto,
  type IHandTelepresenceWithAuthenticationTokenDto,
} from '../../server/controller/dto.ts';
import { ClientBase } from './ClientBase.ts';

export class HandTelepresenceClient extends ClientBase {
  private _myHandTelepresence: IHandTelepresenceWithAuthenticationTokenDto | undefined;
  public get myHandTelepresence() {
    return this._myHandTelepresence;
  }

  private _handTelepresences = new Map<IHandTelepresenceDto['id'], IHandTelepresenceDto>();
  public get handTelepresences() {
    return this._handTelepresences;
  }

  public constructor(param: ConstructorParameters<typeof ClientBase>[0]) {
    super(param);
    this.socket.on('s:handTelepresence:ready', (param) => {
      this._myHandTelepresence = param.handTelepresence;
    });
    this.socket.on('s:handTelepresence:changed', (param) => {
      this._handTelepresences.set(param.handTelepresence.id, param.handTelepresence);
    });
  }

  public create(param: IClientToServerEventParams['c:handTelepresence:create']) {
    this.socket.emit('c:handTelepresence:create', param);
    this.startProcess();

    this.socket.once('s:handTelepresence:create:ok', (param) => {
      this._myHandTelepresence = param.handTelepresence;
      this.finishProcess('s:handTelepresence:create:error');
    });

    this.socket.once('s:game:create:error', (param) => {
      this.handleError('s:handTelepresence:create:ok', param);
    });
  }

  public holdCard(param: IClientToServerEventParams['c:handTelepresence:cards:hold']) {
    this.socket.emit('c:handTelepresence:cards:hold', param);
    this.startProcess();

    this.socket.once('s:handTelepresence:cards:hold:ok', (param) => {
      this._myHandTelepresence = {
        ...param.handTelepresence,
        authenticationToken: this._myHandTelepresence?.authenticationToken!,
      };
      this._handTelepresences.set(param.handTelepresence.id, param.handTelepresence);
      this.finishProcess('s:handTelepresence:cards:hold:error');
    });

    this.socket.once('s:handTelepresence:cards:hold:error', (param) => {
      this.handleError('s:handTelepresence:cards:hold:ok', param);
    });
  }

  public lookCard(param: IClientToServerEventParams['c:handTelepresence:cards:look']) {
    this.socket.emit('c:handTelepresence:cards:look', param);
    this.startProcess();

    this.socket.once('s:handTelepresence:cards:look:ok', (param) => {
      this._myHandTelepresence = {
        ...param.handTelepresence,
        authenticationToken: this._myHandTelepresence?.authenticationToken!,
      };
      this._handTelepresences.set(param.handTelepresence.id, param.handTelepresence);
      this.finishProcess('s:handTelepresence:cards:look:error');
    });

    this.socket.once('s:handTelepresence:cards:look:error', (param) => {
      this.handleError('s:handTelepresence:cards:look:ok', param);
    });
  }

  public scrubCard(param: IClientToServerEventParams['c:handTelepresence:cards:scrub']) {
    this.socket.emit('c:handTelepresence:cards:scrub', param);
    this.startProcess();

    this.socket.once('s:handTelepresence:cards:scrub:ok', (param) => {
      this._myHandTelepresence = {
        ...param.handTelepresence,
        authenticationToken: this._myHandTelepresence?.authenticationToken!,
      };
      this._handTelepresences.set(param.handTelepresence.id, param.handTelepresence);
      this.finishProcess('s:handTelepresence:cards:scrub:error');
    });

    this.socket.once('s:handTelepresence:cards:scrub:error', (param) => {
      this.handleError('s:handTelepresence:cards:scrub:ok', param);
    });
  }

  public pickCard(param: IClientToServerEventParams['c:handTelepresence:cards:pick']) {
    this.socket.emit('c:handTelepresence:cards:pick', param);
    this.startProcess();

    this.socket.once('s:handTelepresence:cards:pick:ok', (param) => {
      this._myHandTelepresence = {
        ...param.handTelepresence,
        authenticationToken: this._myHandTelepresence?.authenticationToken!,
      };
      this._handTelepresences.set(param.handTelepresence.id, param.handTelepresence);
      this.finishProcess('s:handTelepresence:cards:pick:error');
    });

    this.socket.once('s:handTelepresence:cards:pick:error', (param) => {
      this.handleError('s:handTelepresence:cards:pick:ok', param);
    });
  }
}
