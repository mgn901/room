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
import { type IDtoOfErrorOrException } from '../controller/dto.ts';
import { type changeTurn } from '../interactors/games/changeTurn.ts';
import { type createGame } from '../interactors/games/createGame.ts';
import { type createWaitingRoom } from '../interactors/games/createWaitingRoom.ts';
import { type joinWaitingRoom } from '../interactors/games/joinWaitingRoom.ts';
import { type kickPlayer } from '../interactors/games/kickPlayer.ts';
import { type leaveWaitingRoom } from '../interactors/games/leaveWaitingRoom.ts';
import { type win } from '../interactors/games/win.ts';
import { type discardPairs } from '../interactors/players/discardPairs.ts';
import { type proceedAction } from '../interactors/players/proceedAction.ts';
import { type createHandTelepresence } from '../interactors/shared-hands/createHandTelepresence.ts';
import { type holdCard } from '../interactors/shared-hands/holdCard.ts';
import { type lookCard } from '../interactors/shared-hands/lookCard.ts';
import { type pickCard } from '../interactors/shared-hands/pickCard.ts';
import { type scrubCard } from '../interactors/shared-hands/scrubCard.ts';

export interface IClientToServerEventParams {
  'c:waitingRoom:create': TInputOf<typeof createWaitingRoom>;
  'c:waitingRoom:players:join': TInputOf<typeof joinWaitingRoom>;
  'c:waitingRoom:players:kick': TInputOf<typeof kickPlayer>;
  'c:waitingRoom:players:leave': TInputOf<typeof leaveWaitingRoom>;
  'c:game:create': TInputOf<typeof createGame>;
  'c:game:changeTurn': TInputOf<typeof changeTurn>;
  'c:game:win': TInputOf<typeof win>;
  'c:handTelepresence:create': TInputOf<typeof createHandTelepresence>;
  'c:handTelepresence:cards:hold': TInputOf<typeof holdCard>;
  'c:handTelepresence:cards:look': TInputOf<typeof lookCard>;
  'c:handTelepresence:cards:scrub': TInputOf<typeof scrubCard>;
  'c:handTelepresence:cards:pick': TInputOf<typeof pickCard>;
  'c:player:proceedAction': TInputOf<typeof proceedAction>;
  'c:player:discard': TInputOf<typeof discardPairs>;
}

export type IClientToServerEvents = {
  [k in keyof IClientToServerEventParams]: TEventMapItemOf<IClientToServerEventParams[k]>;
};

export interface IServerToClientEventParams {
  's:waitingRoom:changed': { waitingRoom: IWaitingRoomDto };
  's:game:changed': { game: IGameDto };
  's:handTelepresence:changed': { handTelepresence: IHandTelepresenceDto };
  's:handTelepresence:ready': { handTelepresence: IHandTelepresenceWithAuthenticationTokenDto };
  's:player:changed': { player: IPlayerDto };
  's:waitingRoom:create:ok': {
    waitingRoom: IWaitingRoomWithSecretDto;
    waitingPlayer: IWaitingPlayerWithAuthenticationTokenDto;
  };
  's:waitingRoom:players:join:ok': {
    waitingRoom: IWaitingRoomWithSecretDto;
    newPlayer: IWaitingPlayerWithAuthenticationTokenDto;
  };
  's:waitingRoom:players:kick:ok': TDtoOf<TSuccessOutputOf<typeof kickPlayer>>;
  's:waitingRoom:players:leave:ok': TDtoOf<TSuccessOutputOf<typeof leaveWaitingRoom>>;
  's:game:create:ok': TDtoOf<TSuccessOutputOf<typeof createGame>>;
  's:game:changeTurn:ok': TDtoOf<TSuccessOutputOf<typeof changeTurn>>;
  's:game:win:ok': TDtoOf<TSuccessOutputOf<typeof win>>;
  's:handTelepresence:create:ok': { handTelepresence: IHandTelepresenceWithAuthenticationTokenDto };
  's:handTelepresence:cards:hold:ok': TDtoOf<TSuccessOutputOf<typeof holdCard>>;
  's:handTelepresence:cards:look:ok': TDtoOf<TSuccessOutputOf<typeof lookCard>>;
  's:handTelepresence:cards:scrub:ok': TDtoOf<TSuccessOutputOf<typeof scrubCard>>;
  's:handTelepresence:cards:pick:ok': TDtoOf<TSuccessOutputOf<typeof pickCard>>;
  's:player:proceedAction:ok': TDtoOf<TSuccessOutputOf<typeof proceedAction>>;
  's:player:discard:ok': TDtoOf<TSuccessOutputOf<typeof discardPairs>>;
  's:waitingRoom:create:error': IDtoOfErrorOrException;
  's:waitingRoom:players:join:error': IDtoOfErrorOrException;
  's:waitingRoom:players:kick:error': IDtoOfErrorOrException;
  's:waitingRoom:players:leave:error': IDtoOfErrorOrException;
  's:game:create:error': IDtoOfErrorOrException;
  's:game:changeTurn:error': IDtoOfErrorOrException;
  's:game:win:error': IDtoOfErrorOrException;
  's:handTelepresence:create:error': IDtoOfErrorOrException;
  's:handTelepresence:cards:hold:error': IDtoOfErrorOrException;
  's:handTelepresence:cards:look:error': IDtoOfErrorOrException;
  's:handTelepresence:cards:scrub:error': IDtoOfErrorOrException;
  's:handTelepresence:cards:pick:error': IDtoOfErrorOrException;
  's:player:proceedAction:error': IDtoOfErrorOrException;
  's:player:discard:error': IDtoOfErrorOrException;
}

export type IServerToClientEvents = {
  [k in keyof IServerToClientEventParams]: TEventMapItemOf<IServerToClientEventParams[k]>;
};

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
