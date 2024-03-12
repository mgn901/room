import { HandTelepresence } from '../../model/hand-telepresence/HandTelepresence.ts';
import { Success, TResult } from '../../utils/result/TResult.ts';
import { RepositoryError } from './RepositoryError.ts';

export class HandTelepresenceRepository {
  private map = new Map<HandTelepresence['id'], HandTelepresence>();

  public findById(
    id: HandTelepresence['id'],
  ): TResult<HandTelepresence | undefined, RepositoryError> {
    return new Success(this.map.get(id));
  }

  public save(game: HandTelepresence): TResult<true, RepositoryError> {
    this.map.set(game.id, game);
    return new Success(true as const);
  }

  public delete(id: HandTelepresence['id']): TResult<true, RepositoryError> {
    this.map.delete(id);
    return new Success(true as const);
  }
}
