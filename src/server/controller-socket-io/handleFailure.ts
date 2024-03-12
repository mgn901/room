import { Failure } from '../../utils/result/TResult.ts';
import { IServerToClientEvents, TSocket } from './socketIoTypes.ts';

export const handleFailure = (param: {
  socket: TSocket;
  name: keyof IServerToClientEvents & `${string}:error`;
  failure: Failure<Error>;
}): void => {
  param.socket.emit(param.name, {
    name: param.failure.value.name,
    message: param.failure.value.message,
  });
};
