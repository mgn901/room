import { WaitingRoom } from '../../model/game/WaitingRoom.ts';
import { Success, TResult } from '../../utils/result/TResult.ts';
import { RepositoryError } from './RepositoryError.ts';

export class WaitingRoomRepository {
  private mapById = new Map<WaitingRoom['id'], WaitingRoom>();
  private mapBySecret = new Map<ReturnType<WaitingRoom['dangerouslyGetSecret']>, WaitingRoom>();

  public findById(id: WaitingRoom['id']): TResult<WaitingRoom | undefined, RepositoryError> {
    return new Success(this.mapById.get(id));
  }

  public findBySecret(
    secret: ReturnType<WaitingRoom['dangerouslyGetSecret']>,
  ): TResult<WaitingRoom | undefined, RepositoryError> {
    return new Success(this.mapBySecret.get(secret));
  }

  public save(game: WaitingRoom): TResult<true, RepositoryError> {
    this.mapById.set(game.id, game);
    this.mapBySecret.set(game.dangerouslyGetSecret(), game);
    return new Success(true as const);
  }

  public delete(id: WaitingRoom['id']): TResult<true, RepositoryError> {
    const deleted = this.mapById.get(id);
    this.mapById.delete(id);
    if (deleted !== undefined) {
      this.mapBySecret.delete(deleted.dangerouslyGetSecret());
    }
    return new Success(true as const);
  }
}
