import { type Socket, io } from 'socket.io-client';
import {
  type IClientToServerEvents,
  type IServerToClientEvents,
} from '../../server/controller-socket-io/socketIoTypes.ts';
import { GameClient } from './GameClient.ts';
import { HandTelepresenceClient } from './HandTelepresenceClient.ts';
import { PlayerClient } from './PlayerClient.ts';
import { WaitingRoomClient } from './WaitingRoomClient.ts';

export type TSocket = Socket<IServerToClientEvents, IClientToServerEvents>;

export class Client {
  private readonly socket: TSocket = io();
  public readonly waitingRoomClient = new WaitingRoomClient({ socket: this.socket });
  public readonly gameClient = new GameClient({ socket: this.socket });
  public readonly playerClient = new PlayerClient({ socket: this.socket });
  public readonly handTelepresenceClient = new HandTelepresenceClient({ socket: this.socket });
}
