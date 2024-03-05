import type { IImplementationContainer } from '../implementation-containers/IImplementationContainer.ts';

export class ControllerBase {
  protected readonly container: IImplementationContainer;
  public constructor(container: IImplementationContainer) {
    this.container = container;
  }
  public start(): void {}
}
