import { Game } from '../../model/game/Game.ts';
import { Success, TResult } from '../../utils/result/TResult.ts';
import { RepositoryError } from './RepositoryError.ts';

export class GameRepository {
  private map = new Map<Game['id'], Game>();

  public findById(id: Game['id']): TResult<Game | undefined, RepositoryError> {
    return new Success(this.map.get(id));
  }

  public save(game: Game): TResult<true, RepositoryError> {
    this.map.set(game.id, game);
    return new Success(true as const);
  }

  public delete(id: Game['id']): TResult<true, RepositoryError> {
    this.map.delete(id);
    return new Success(true as const);
  }
}
