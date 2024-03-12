import { GameRepository } from '../repositories/GameRepository.ts';
import { HandTelepresenceRepository } from '../repositories/HandTelepresenceRepository.ts';
import { PlayerRepository } from '../repositories/PlayerRepository.ts';
import { WaitingRoomRepository } from '../repositories/WaitingRoomRepository.ts';
import { Env } from './Env.node.ts';
import { IImplementationContainer } from './IImplementationContainer.ts';
// const { PrismaClient } = await import('../prisma-client');

export class ImplementationContainer implements IImplementationContainer {
  public readonly env: Env;
  public readonly waitingRoomRepository: WaitingRoomRepository;
  public readonly gameRepository: GameRepository;
  public readonly playerRepository: PlayerRepository;
  public readonly handTelepresenceRepository: HandTelepresenceRepository;

  public constructor() {
    this.env = new Env();
    this.waitingRoomRepository = new WaitingRoomRepository();
    this.gameRepository = new GameRepository();
    this.playerRepository = new PlayerRepository();
    this.handTelepresenceRepository = new HandTelepresenceRepository();

    // if (this.env.ENTITYREPOSITORY_TYPE === 'mock') {
    // } else {
    // }
  }
}
