import { Failure } from '../../utils/result/TResult.ts';
import {
  toGameDto,
  toHandTelepresenceDto,
  toHandTelepresenceWithAuthenticationTokenDto,
  toPlayerDto,
  toWaitingPlayerWithAuthenticationTokenDto,
  toWaitingRoomDto,
  toWaitingRoomWithSecretDto,
} from '../controller/dto.ts';
import { type IImplementationContainer } from '../implementation-containers/IImplementationContainer.ts';
import { createGame } from '../interactors/games/createGame.ts';
import { createWaitingRoom } from '../interactors/games/createWaitingRoom.ts';
import { joinWaitingRoom } from '../interactors/games/joinWaitingRoom.ts';
import { kickPlayer } from '../interactors/games/kickPlayer.ts';
import { leaveWaitingRoom } from '../interactors/games/leaveWaitingRoom.ts';
import { discardPairs } from '../interactors/players/discardPairs.ts';
import { proceedAction } from '../interactors/players/proceedAction.ts';
import { createHandTelepresence } from '../interactors/shared-hands/createHandTelepresence.ts';
import { holdCard } from '../interactors/shared-hands/holdCard.ts';
import { lookCard } from '../interactors/shared-hands/lookCard.ts';
import { pickCard } from '../interactors/shared-hands/pickCard.ts';
import { scrubCard } from '../interactors/shared-hands/scrubCard.ts';
import { handleFailure } from './handleFailure.ts';
import { type TSocket } from './socketIoTypes.ts';

export const listenSocket = (
  socket: TSocket,
  implementationContainer: IImplementationContainer,
) => {
  socket.on('c:waitingRoom:create', (param) => {
    const result = createWaitingRoom({ ...param, implementationContainer });
    if (result instanceof Failure) {
      handleFailure({ socket, name: 's:waitingRoom:create:error', failure: result });
      return;
    }
    socket.join(`waitingRoom:${result.value.waitingRoom.id}`);
    socket.emit('s:waitingRoom:create:ok', {
      waitingRoom: toWaitingRoomWithSecretDto(result.value.waitingRoom),
    });
  });

  socket.on('c:waitingRoom:players:join', (param) => {
    const result = joinWaitingRoom({ ...param, implementationContainer });
    if (result instanceof Failure) {
      handleFailure({ socket, name: 's:waitingRoom:players:join:error', failure: result });
      return;
    }
    socket.join(`waitingRoom:${result.value.waitingRoom.id}`);
    socket
      .in(`waitingRoom:${result.value.waitingRoom.id}`)
      .emit('s:waitingRoom:changed', { waitingRoom: toWaitingRoomDto(result.value.waitingRoom) });
    socket.emit('s:waitingRoom:players:join:ok', {
      newPlayer: toWaitingPlayerWithAuthenticationTokenDto(result.value.newPlayer),
      waitingRoom: toWaitingRoomWithSecretDto(result.value.waitingRoom),
    });
  });

  socket.on('c:waitingRoom:players:kick', (param) => {
    const result = kickPlayer({ ...param, implementationContainer });
    if (result instanceof Failure) {
      handleFailure({ socket, name: 's:waitingRoom:players:kick:error', failure: result });
      return;
    }
    socket
      .in(`waitingRoom:${result.value.waitingRoom}`)
      .emit('s:waitingRoom:changed', { waitingRoom: toWaitingRoomDto(result.value.waitingRoom) });
  });

  socket.on('c:waitingRoom:players:leave', (param) => {
    const result = leaveWaitingRoom({ ...param, implementationContainer });
    if (result instanceof Failure) {
      handleFailure({ socket, name: 's:waitingRoom:players:leave:error', failure: result });
      return;
    }
    socket.leave(`waitingRoom:${result.value.waitingRoom.id}`);
    socket
      .in(`waitingRoom:${result.value.waitingRoom.id}`)
      .emit('s:waitingRoom:changed', { waitingRoom: toWaitingRoomDto(result.value.waitingRoom) });
    socket.emit('s:waitingRoom:players:leave:ok', {
      waitingRoom: toWaitingRoomDto(result.value.waitingRoom),
    });
  });

  socket.on('c:game:create', (param) => {
    const result = createGame({ ...param, implementationContainer });
    if (result instanceof Failure) {
      handleFailure({ socket, name: 's:game:create:error', failure: result });
      return;
    }
    socket.in(`waitingRoom:${result.value.game.id}`).socketsJoin(`game:${result.value.game.id}`);
    socket.in(`game:${result.value.game.id}`).socketsLeave(`waitingRoom:${result.value.game.id}`);
    socket
      .in(`game:${result.value.game.id}`)
      .emit('s:game:changed', { game: toGameDto(result.value.game) });
    socket.emit('s:game:create:ok', { game: toGameDto(result.value.game) });
  });

  socket.on('c:handTelepresence:create', (param) => {
    const result = createHandTelepresence({ ...param, implementationContainer });
    if (result instanceof Failure) {
      handleFailure({ socket, name: 's:handTelepresence:create:error', failure: result });
      return;
    }
    socket.in([...socket.rooms]).emit('s:handTelepresence:changed', {
      handTelepresence: toHandTelepresenceDto(result.value.handTelepresence),
    });
    socket.emit('s:handTelepresence:create:ok', {
      handTelepresence: toHandTelepresenceWithAuthenticationTokenDto(result.value.handTelepresence),
    });
  });

  socket.on('c:handTelepresence:cards:hold', (param) => {
    const result = holdCard({ ...param, implementationContainer });
    if (result instanceof Failure) {
      handleFailure({ socket, name: 's:handTelepresence:cards:hold:error', failure: result });
      return;
    }
    socket.in([...socket.rooms]).emit('s:handTelepresence:changed', {
      handTelepresence: toHandTelepresenceDto(result.value.handTelepresence),
    });
    socket.emit('s:handTelepresence:cards:hold:ok', {
      handTelepresence: toHandTelepresenceDto(result.value.handTelepresence),
    });
  });

  socket.on('c:handTelepresence:cards:look', (param) => {
    const result = lookCard({ ...param, implementationContainer });
    if (result instanceof Failure) {
      handleFailure({ socket, name: 's:handTelepresence:cards:look:error', failure: result });
      return;
    }
    socket.in([...socket.rooms]).emit('s:handTelepresence:changed', {
      handTelepresence: toHandTelepresenceDto(result.value.handTelepresence),
    });
    socket.emit('s:handTelepresence:cards:look:ok', {
      handTelepresence: toHandTelepresenceDto(result.value.handTelepresence),
    });
  });

  socket.on('c:handTelepresence:cards:scrub', (param) => {
    const result = scrubCard({ ...param, implementationContainer });
    if (result instanceof Failure) {
      handleFailure({ socket, name: 's:handTelepresence:cards:scrub:error', failure: result });
      return;
    }
    socket.in([...socket.rooms]).emit('s:handTelepresence:changed', {
      handTelepresence: toHandTelepresenceDto(result.value.handTelepresence),
    });
    socket.emit('s:handTelepresence:cards:scrub:ok', {
      handTelepresence: toHandTelepresenceDto(result.value.handTelepresence),
    });
  });

  socket.on('c:handTelepresence:cards:pick', (param) => {
    const result = pickCard({ ...param, implementationContainer });
    if (result instanceof Failure) {
      handleFailure({ socket, name: 's:handTelepresence:cards:pick:error', failure: result });
      return;
    }
    socket.in([...socket.rooms]).emit('s:handTelepresence:changed', {
      handTelepresence: toHandTelepresenceDto(result.value.handTelepresence),
    });
    socket.emit('s:handTelepresence:cards:pick:ok', {
      handTelepresence: toHandTelepresenceDto(result.value.handTelepresence),
    });
  });

  socket.on('c:player:proceedAction', (param) => {
    const result = proceedAction({ ...param, implementationContainer });
    if (result instanceof Failure) {
      handleFailure({ socket, name: 's:player:proceedAction:error', failure: result });
      return;
    }
    socket.in([...socket.rooms]).emit('s:player:changed', { player: toPlayerDto(result.value.me) });
    socket
      .in([...socket.rooms])
      .emit('s:player:changed', { player: toPlayerDto(result.value.next) });
    socket.emit('s:player:proceedAction:ok', {
      me: toPlayerDto(result.value.me),
      next: toPlayerDto(result.value.next),
    });
  });

  socket.on('c:player:discard', (param) => {
    const result = discardPairs({ ...param, implementationContainer });
    if (result instanceof Failure) {
      handleFailure({ socket, name: 's:player:discard:error', failure: result });
      return;
    }
    socket.in([...socket.rooms]).emit('s:game:changed', { game: toGameDto(result.value.game) });
    socket
      .in([...socket.rooms])
      .emit('s:player:changed', { player: toPlayerDto(result.value.player) });
    socket.emit('s:player:discard:ok', {
      game: toGameDto(result.value.game),
      player: toPlayerDto(result.value.player),
    });
  });
};
