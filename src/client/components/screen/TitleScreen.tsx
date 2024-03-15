import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { useWaitingRoomClient } from '../clientHooks.ts';

export const TitleScreen: FC = () => {
  const waitingRoomClient = useWaitingRoomClient();

  if (waitingRoomClient.waitingRoom !== undefined) {
    return <></>;
  }

  const handleClickCreateRoom = () => {
    waitingRoomClient.create();
  };

  return (
    <div>
      <div>
        <Link to="/waiting-rooms/room" onClick={handleClickCreateRoom}>
          ルームを作成
        </Link>
        <Link to="/waiting-rooms/join">ルームに参加</Link>
      </div>
    </div>
  );
};
