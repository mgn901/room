import { type Game } from '../../model/game/Game.ts';
import { type IWaitingPlayer } from '../../model/game/IWaitingPlayer.ts';
import { type Table } from '../../model/game/Table.ts';
import { type WaitingRoom } from '../../model/game/WaitingRoom.ts';
import { type CardState } from '../../model/hand-telepresence/CardState.ts';
import { type HandTelepresence } from '../../model/hand-telepresence/HandTelepresence.ts';
import { type Player } from '../../model/player/Player.ts';
import { type ICard } from '../../model/values/ICard.ts';
import { type TPrimitive } from '../../utils/primitives/TPrimitive.ts';
import { type TLongSecret } from '../../utils/random-values/TLongSecret.ts';
import { type TShortSecret } from '../../utils/random-values/TShortSecret.ts';

export type TDtoOf<E extends object> = Omit<
  {
    [k in keyof E as E[k] extends (...args: never) => unknown ? never : k]: E[k] extends
      | TPrimitive
      | TPrimitive[]
      ? E[k]
      : E[k] extends object[]
        ? TDtoOf<E[k][number]>[]
        : E[k] extends object
          ? TDtoOf<E[k]>
          : never;
  },
  symbol
>;

export type IGameDto = TDtoOf<Game>;
export type ITableDto = TDtoOf<Table>;

export type IWaitingRoomDto = TDtoOf<WaitingRoom>;
export type IWaitingRoomWithSecretDto = IWaitingRoomDto & {
  secret: TShortSecret;
};
export type IWaitingPlayerDto = TDtoOf<IWaitingPlayer>;
export type IWaitingPlayerWithAuthenticationTokenDto = IWaitingPlayerDto & {
  authenticationToken: TLongSecret;
};

export type IPlayerDto = TDtoOf<Player>;
export type IPlayerWithAuthenticationTokenDto = IPlayerDto & {
  authenticationToken: TLongSecret;
};

export type IHandTelepresenceDto = TDtoOf<HandTelepresence>;
export type IHandTelepresenceWithAuthenticationTokenDto = IHandTelepresenceDto & {
  authenticationToken: TLongSecret;
};
export type ICardStateDto = TDtoOf<CardState>;

export type ICardDto = TDtoOf<ICard>;

export const toGameDto = (game: Game): IGameDto => ({
  id: game.id,
  players: game.players.map(toPlayerDto),
  table: toTableDto(game.table),
});

export const toTableDto = (table: Table): ITableDto => ({
  id: table.id,
  cards: table.cards.map(toCardDto),
});

export const toWaitingRoomDto = (waitingRoom: WaitingRoom): IWaitingRoomDto => ({
  id: waitingRoom.id,
  ownerId: waitingRoom.ownerId,
  players: waitingRoom.players.map(toWaitingPlayerDto),
});

export const toWaitingRoomWithSecretDto = (
  waitingRoom: WaitingRoom,
): IWaitingRoomWithSecretDto => ({
  ...toWaitingRoomDto(waitingRoom),
  secret: waitingRoom.dangerouslyGetSecret(),
});

export const toWaitingPlayerDto = (waitingPlayer: IWaitingPlayer): IWaitingPlayerDto => ({
  id: waitingPlayer.id,
});

export const toWaitingPlayerWithAuthenticationTokenDto = (
  waitingPlayer: IWaitingPlayer,
): IWaitingPlayerWithAuthenticationTokenDto => ({
  ...toWaitingPlayerDto(waitingPlayer),
  authenticationToken: waitingPlayer.dangerouslyGetAuthenticationToken(),
});

export const toPlayerDto = (player: Player): IPlayerDto => ({
  id: player.id,
  cardsInHand: player.cardsInHand.map(toCardDto),
  playerIdOnNext: player.playerIdOnNext,
  playerIdOnPrev: player.playerIdOnPrev,
});

export const toPlayerWithAuthenticationTokenDto = (
  player: Player,
): IPlayerWithAuthenticationTokenDto => ({
  ...toPlayerDto(player),
  authenticationToken: player.dangerouslyGetAuthenticationToken(),
});

export const toHandTelepresenceDto = (
  handTelepresence: HandTelepresence,
): IHandTelepresenceDto => ({
  id: handTelepresence.id,
  cards: handTelepresence.cards.map(toCardStateDto),
  lookingAt: handTelepresence.lookingAt,
});

export const toHandTelepresenceWithAuthenticationTokenDto = (
  handTelepresence: HandTelepresence,
): IHandTelepresenceWithAuthenticationTokenDto => ({
  ...toHandTelepresenceDto(handTelepresence),
  authenticationToken: handTelepresence.dangerouslyGetAuthenticationToken(),
});

export const toCardStateDto = (cardState: CardState): ICardStateDto => ({
  card: toCardDto(cardState.card),
  distanceFromInitialPosition: cardState.distanceFromInitialPosition,
  isHolded: cardState.isHolded,
  x: cardState.x,
  y: cardState.y,
});

export const toCardDto = (card: ICard): ICardDto => ({
  rank: card.rank,
  suit: card.suit,
});
