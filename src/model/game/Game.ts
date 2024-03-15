import { type TParameterize } from '../../utils/dto-of/TParameterize.ts';
import { type TNominalPrimitive } from '../../utils/primitives/TNominalPrimitive.ts';
import { type TId } from '../../utils/random-values/TId.ts';
import { Failure, Success, type TResult } from '../../utils/result/TResult.ts';
import { ApplicationErrorOrException } from '../errors/ApplicationErrorOrException.ts';
import { IllegalContextException } from '../errors/IllegalContextException.ts';
import { IllegalParamException } from '../errors/IllegalParamException.ts';
import { Player } from '../player/Player.ts';
import { PlayerContext } from '../player/PlayerContext.ts';
import { type GamePlayerContext } from './GamePlayerContext.ts';
import { Table } from './Table.ts';
import { type WaitingRoom } from './WaitingRoom.ts';

export const gameTypeSymbol = Symbol();

/** ババ抜きの競技1回とその状態を表現するエンティティクラス。 */
export class Game {
  public readonly [gameTypeSymbol]: unknown;

  /** 競技のID。 */
  public readonly id: TNominalPrimitive<TId, typeof gameTypeSymbol>;

  /** 競技に参加しているプレイヤーの一覧。 */
  public readonly players: Readonly<Player[]>;

  /** 上がったプレイヤーの一覧。 */
  public readonly winners: Readonly<Player['id'][]>;

  public readonly playerIdProceeding: Player['id'];

  public readonly playerIdProceeded: Player['id'];

  /** 場（カードを捨てる場所）。 */
  public readonly table: Table;

  //#region コンストラクタ他
  private constructor(param: TParameterize<Game>) {
    this.id = param.id;
    this.players = param.players;
    this.winners = param.winners;
    this.playerIdProceeding = param.playerIdProceeding;
    this.playerIdProceeded = param.playerIdProceeded;
    this.table = param.table;
  }

  public static fromDto(param: TParameterize<Game>): Game {
    return new Game(param);
  }
  //#endregion

  /** 競技のオブジェクトを作成する。 */
  public static create(param: {
    /** 作成元となる待合室のオブジェクト。 */
    readonly waitingRoom: WaitingRoom;
  }): TResult<
    {
      /** 作成された競技のオブジェクト。 */
      game: Game;
    },
    IllegalParamException
  > {
    const createPlayersResult = Player.createManyForOneGame({
      waitingPlayers: param.waitingRoom.players,
    });
    if (createPlayersResult instanceof Failure) {
      return new Failure(createPlayersResult.value);
    }

    return new Success({
      game: new Game({
        id: param.waitingRoom.id,
        players: createPlayersResult.value.players,
        winners: [],
        playerIdProceeding: createPlayersResult.value.players[0].id,
        playerIdProceeded:
          createPlayersResult.value.players[createPlayersResult.value.players.length - 1].id,
        table: Table.create({ id: param.waitingRoom.id }).value.table,
      }),
    });
  }

  public toTurnChanged(param: {
    context: PlayerContext;
    playerProceeding: Player;
    playerProceeded: Player;
  }): TResult<
    {
      game: Game;
    },
    IllegalTurnChangeExeption
  > {
    if (
      param.context.playerId !== this.playerIdProceeding ||
      param.context.playerId !== param.playerProceeding.id
    ) {
      return new Failure(
        new IllegalTurnChangeExeption(
          '他のプレイヤーがアクションの終了を宣言することはできません。',
        ),
      );
    }

    const playerIndexProceeding = this.players.findIndex(
      (player) => player.id === this.playerIdProceeding,
    );
    const playerIndexProceeded = this.players.findIndex(
      (player) => player.id === this.playerIdProceeded,
    );

    // 取られて上がり・取って上がりが両方いる場合
    if (
      param.playerProceeding.cardsInHand.length === 0 &&
      param.playerProceeded.cardsInHand.length === 0
    ) {
      const newWinners = [...this.winners, param.playerProceeded.id, param.playerProceeding.id];
      const newPlayers = this.players.filter((player) => !newWinners.includes(player.id));
      return new Success({
        game: new Game({
          ...this,
          players: newPlayers.length <= 1 ? [] : newPlayers,
          winners: newPlayers.length <= 1 ? [...newWinners, ...newPlayers] : newWinners,
          // 取られて上がった人の前の人
          playerIdProceeded:
            this.players[
              playerIndexProceeded === 0 ? this.players.length - 1 : playerIndexProceeded - 1
            ].id,
          // 次の人
          playerIdProceeding: this.players[(playerIndexProceeding + 1) % this.players.length].id,
        }),
      });
    }

    // 取って上がった場合
    if (param.playerProceeding.cardsInHand.length === 0) {
      const newWinners = [...this.winners, param.playerProceeding.id];
      const newPlayers = this.players.filter((player) => !newWinners.includes(player.id));
      return new Success({
        game: new Game({
          ...this,
          players: newPlayers.length <= 1 ? [] : newPlayers,
          winners: newPlayers.length <= 1 ? [...newWinners, ...newPlayers] : newWinners,
          // 取って上がった人の前の人
          playerIdProceeded:
            this.players[
              playerIndexProceeding === 0 ? this.players.length - 1 : playerIndexProceeding - 1
            ].id,
          // 次の人
          playerIdProceeding: this.players[(playerIndexProceeding + 1) % this.players.length].id,
        }),
      });
    }

    // 取られて上がった場合
    if (param.playerProceeded.cardsInHand.length === 0) {
      const newWinners = [...this.winners, param.playerProceeded.id];
      const newPlayers = this.players.filter((player) => !newWinners.includes(player.id));
      return new Success({
        game: new Game({
          ...this,
          players: newPlayers.length <= 1 ? [] : newPlayers,
          winners: newPlayers.length <= 1 ? [...newWinners, ...newPlayers] : newWinners,
          // 次の人
          playerIdProceeded: this.players[(playerIndexProceeded + 1) % this.players.length].id,
          // 次の人
          playerIdProceeding: this.players[(playerIndexProceeding + 1) % this.players.length].id,
        }),
      });
    }

    return new Success({
      game: new Game({
        ...this,
        // 次の人
        playerIdProceeded: this.players[(playerIndexProceeded + 1) % this.players.length].id,
        // 次の人
        playerIdProceeding: this.players[(playerIndexProceeding + 1) % this.players.length].id,
      }),
    });
  }

  public toTableSet(param: {
    table: Table;
    context: GamePlayerContext;
  }): Success<{
    game: Game;
  }> {
    if (param.context.gameId !== this.id) {
      throw new IllegalContextException();
    }
    return new Success({ game: new Game({ ...this, table: param.table }) });
  }
}

export class IllegalTurnChangeExeption extends ApplicationErrorOrException {
  public readonly name = 'IllegalTurnChangeExeption';
}
