import { type Server, type Socket } from 'socket.io';
import { type Failure, type Success, type TResult } from '../../utils/result/TResult.ts';
import {
  type IGameDto,
  type IHandTelepresenceDto,
  type IHandTelepresenceWithAuthenticationTokenDto,
  type IPlayerDto,
  type IWaitingPlayerWithAuthenticationTokenDto,
  type IWaitingRoomDto,
  type IWaitingRoomWithSecretDto,
  type TDtoOf,
} from '../controller/dto.ts';
import { type createGame } from '../interactors/games/createGame.ts';
import { type createWaitingRoom } from '../interactors/games/createWaitingRoom.ts';
import { type joinWaitingRoom } from '../interactors/games/joinWaitingRoom.ts';
import { type kickPlayer } from '../interactors/games/kickPlayer.ts';
import { type leaveWaitingRoom } from '../interactors/games/leaveWaitingRoom.ts';
import { type discardPairs } from '../interactors/players/discardPairs.ts';
import { type proceedAction } from '../interactors/players/proceedAction.ts';
import { type createHandTelepresence } from '../interactors/shared-hands/createHandTelepresence.ts';
import { type holdCard } from '../interactors/shared-hands/holdCard.ts';
import { type lookCard } from '../interactors/shared-hands/lookCard.ts';
import { type pickCard } from '../interactors/shared-hands/pickCard.ts';
import { type scrubCard } from '../interactors/shared-hands/scrubCard.ts';

export interface IClientToServerEvents {
  'c:waitingRoom:create': TEventMapItemOf<TInputOf<typeof createWaitingRoom>>;
  'c:waitingRoom:players:join': TEventMapItemOf<TInputOf<typeof joinWaitingRoom>>;
  'c:waitingRoom:players:kick': TEventMapItemOf<TInputOf<typeof kickPlayer>>;
  'c:waitingRoom:players:leave': TEventMapItemOf<TInputOf<typeof leaveWaitingRoom>>;
  'c:game:create': TEventMapItemOf<TInputOf<typeof createGame>>;
  'c:handTelepresence:create': TEventMapItemOf<TInputOf<typeof createHandTelepresence>>;
  'c:handTelepresence:cards:hold': TEventMapItemOf<TInputOf<typeof holdCard>>;
  'c:handTelepresence:cards:look': TEventMapItemOf<TInputOf<typeof lookCard>>;
  'c:handTelepresence:cards:scrub': TEventMapItemOf<TInputOf<typeof scrubCard>>;
  'c:handTelepresence:cards:pick': TEventMapItemOf<TInputOf<typeof pickCard>>;
  'c:player:proceedAction': TEventMapItemOf<TInputOf<typeof proceedAction>>;
  'c:player:discard': TEventMapItemOf<TInputOf<typeof discardPairs>>;
}

export interface IServerToClientEvents {
  's:waitingRoom:changed': TEventMapItemOf<{ waitingRoom: IWaitingRoomDto }>;
  's:game:changed': TEventMapItemOf<{ game: IGameDto }>;
  's:handTelepresence:changed': TEventMapItemOf<{ handTelepresence: IHandTelepresenceDto }>;
  's:player:changed': TEventMapItemOf<{ player: IPlayerDto }>;
  's:waitingRoom:create:ok': TEventMapItemOf<{ waitingRoom: IWaitingRoomWithSecretDto }>;
  's:waitingRoom:players:join:ok': TEventMapItemOf<{
    waitingRoom: IWaitingRoomWithSecretDto;
    newPlayer: IWaitingPlayerWithAuthenticationTokenDto;
  }>;
  's:waitingRoom:players:kick:ok': TEventMapItemOf<TDtoOf<TSuccessOutputOf<typeof kickPlayer>>>;
  's:waitingRoom:players:leave:ok': TEventMapItemOf<
    TDtoOf<TSuccessOutputOf<typeof leaveWaitingRoom>>
  >;
  's:game:create:ok': TEventMapItemOf<TDtoOf<TSuccessOutputOf<typeof createGame>>>;
  's:handTelepresence:create:ok': TEventMapItemOf<{
    handTelepresence: IHandTelepresenceWithAuthenticationTokenDto;
  }>;
  's:handTelepresence:cards:hold:ok': TEventMapItemOf<TDtoOf<TSuccessOutputOf<typeof holdCard>>>;
  's:handTelepresence:cards:look:ok': TEventMapItemOf<TDtoOf<TSuccessOutputOf<typeof lookCard>>>;
  's:handTelepresence:cards:scrub:ok': TEventMapItemOf<TDtoOf<TSuccessOutputOf<typeof scrubCard>>>;
  's:handTelepresence:cards:pick:ok': TEventMapItemOf<TDtoOf<TSuccessOutputOf<typeof pickCard>>>;
  's:player:proceedAction:ok': TEventMapItemOf<TDtoOf<TSuccessOutputOf<typeof proceedAction>>>;
  's:player:discard:ok': TEventMapItemOf<TDtoOf<TSuccessOutputOf<typeof discardPairs>>>;
  's:waitingRoom:create:error': TEventMapItemOf<IDtoOfErrorOrException>;
  's:waitingRoom:players:join:error': TEventMapItemOf<IDtoOfErrorOrException>;
  's:waitingRoom:players:kick:error': TEventMapItemOf<IDtoOfErrorOrException>;
  's:waitingRoom:players:leave:error': TEventMapItemOf<IDtoOfErrorOrException>;
  's:game:create:error': TEventMapItemOf<IDtoOfErrorOrException>;
  's:handTelepresence:create:error': TEventMapItemOf<IDtoOfErrorOrException>;
  's:handTelepresence:cards:hold:error': TEventMapItemOf<IDtoOfErrorOrException>;
  's:handTelepresence:cards:look:error': TEventMapItemOf<IDtoOfErrorOrException>;
  's:handTelepresence:cards:scrub:error': TEventMapItemOf<IDtoOfErrorOrException>;
  's:handTelepresence:cards:pick:error': TEventMapItemOf<IDtoOfErrorOrException>;
  's:player:proceedAction:error': TEventMapItemOf<IDtoOfErrorOrException>;
  's:player:discard:error': TEventMapItemOf<IDtoOfErrorOrException>;
}

export type TSocketIoServer = Server<IClientToServerEvents, IServerToClientEvents>;

export type TSocket = Socket<IClientToServerEvents, IServerToClientEvents>;

type TEventMapItemOf<P> = (param: P) => void;

type TInteractor<P, S, F extends Error> = (param: P) => TResult<S, F>;

type TInputOf<
  I extends TInteractor<P, S, F>,
  P = Parameters<I>[0],
  S = Exclude<ReturnType<I>, Failure<Error>>['value'],
  F extends Error = Exclude<ReturnType<I>, Success<S>>['value'],
> = Omit<Parameters<I>[0], 'implementationContainer'>;

type TSuccessOutputOf<
  I extends TInteractor<P, S, F>,
  P = Parameters<I>[0],
  S = Exclude<ReturnType<I>, Failure<Error>>['value'],
  F extends Error = Exclude<ReturnType<I>, Success<S>>['value'],
> = Extract<ReturnType<I>, Success<S>>['value'];

type IDtoOfErrorOrException = {
  name: string;
  message: string;
};
