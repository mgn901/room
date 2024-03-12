import { Player } from '../../model/player/Player.ts';
import { Success, TResult } from '../../utils/result/TResult.ts';
import { RepositoryError } from './RepositoryError.ts';

export class PlayerRepository {
  private map = new Map<Player['id'], Player>();

  public findById(id: Player['id']): TResult<Player | undefined, RepositoryError> {
    return new Success(this.map.get(id));
  }

  public save(game: Player): TResult<true, RepositoryError> {
    this.map.set(game.id, game);
    return new Success(true as const);
  }

  public delete(id: Player['id']): TResult<true, RepositoryError> {
    this.map.delete(id);
    return new Success(true as const);
  }
}
