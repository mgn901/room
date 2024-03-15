import { type FC } from 'react';
import { Outlet } from 'react-router-dom';

export const WaitingRoomScreen: FC = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};
