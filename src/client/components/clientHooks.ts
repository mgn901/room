import { useSyncExternalStore } from 'react';
import { type ISnapshot } from '../client-socket-io/ClientBase.ts';
import { type GameClient } from '../client-socket-io/GameClient.ts';
import { type HandTelepresenceClient } from '../client-socket-io/HandTelepresenceClient.ts';
import { type PlayerClient } from '../client-socket-io/PlayerClient.ts';
import { type WaitingRoomClient } from '../client-socket-io/WaitingRoomClient.ts';
import { Client } from '../client-socket-io/index.ts';

const client = new Client();

const subscribeFunctionFactory =
  (eventTarget: EventTarget, eventType: string): ((onStoreChange: () => void) => () => void) =>
  (onStoreChange) => {
    eventTarget.addEventListener(eventType, onStoreChange);
    return () => {
      eventTarget.removeEventListener(eventType, onStoreChange);
    };
  };

const subscribeWaitingRoomClient = subscribeFunctionFactory(client.waitingRoomClient, 'update');
const subscribeGameClient = subscribeFunctionFactory(client.gameClient, 'update');
const subscribePlayerClient = subscribeFunctionFactory(client.playerClient, 'update');
const subscribeHandTelepresenceClient = subscribeFunctionFactory(
  client.handTelepresenceClient,
  'update',
);

const getWaitingRoomClientSnapshot = (): ISnapshot<WaitingRoomClient> =>
  client.waitingRoomClient.getSnapshot();
const getGameClientSnapshot = (): ISnapshot<GameClient> => client.gameClient.getSnapshot();
const getPlayerClientSnapshot = (): ISnapshot<PlayerClient> => client.playerClient.getSnapshot();
const getHandTelepresenceClientSnapshot = (): ISnapshot<HandTelepresenceClient> =>
  client.handTelepresenceClient.getSnapshot();

export const useWaitingRoomClient: () => ISnapshot<WaitingRoomClient> = () =>
  useSyncExternalStore(subscribeWaitingRoomClient, getWaitingRoomClientSnapshot);
export const useGameClient: () => ISnapshot<GameClient> = () =>
  useSyncExternalStore(subscribeGameClient, getGameClientSnapshot);
export const usePlayerClient: () => ISnapshot<PlayerClient> = () =>
  useSyncExternalStore(subscribePlayerClient, getPlayerClientSnapshot);
export const useHandTelepresenceClient: () => ISnapshot<HandTelepresenceClient> = () =>
  useSyncExternalStore(subscribeHandTelepresenceClient, getHandTelepresenceClientSnapshot);
