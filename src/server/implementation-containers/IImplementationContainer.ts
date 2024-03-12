import { GameRepository } from '../repositories/GameRepository.ts';
import { HandTelepresenceRepository } from '../repositories/HandTelepresenceRepository.ts';
import { PlayerRepository } from '../repositories/PlayerRepository.ts';
import { WaitingRoomRepository } from '../repositories/WaitingRoomRepository.ts';
import { Env } from './Env.node.ts';

export interface IImplementationContainer {
  readonly env: Env;
  readonly waitingRoomRepository: WaitingRoomRepository;
  readonly gameRepository: GameRepository;
  readonly playerRepository: PlayerRepository;
  readonly handTelepresenceRepository: HandTelepresenceRepository;
}
