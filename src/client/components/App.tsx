import { type FC } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { GameScreen } from './screen/GameScreen.tsx';
import { TitleScreen } from './screen/TitleScreen.tsx';
import { WaitingRoomScreen } from './screen/WaitingRoomScreen.tsx';
import { JoinWaitingRoomContainer } from './waiting-room/JoinWaitingRoomContainer.tsx';
import { WaitingRoomContainer } from './waiting-room/WaitingRoomContainer.tsx';

export const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TitleScreen />} />
        <Route path="/waiting-rooms" element={<WaitingRoomScreen />}>
          <Route path="join/:secret?" element={<JoinWaitingRoomContainer />} />
          <Route path="room" element={<WaitingRoomContainer />} />
        </Route>
        <Route path="/game" element={<GameScreen />} />
      </Routes>
    </BrowserRouter>
  );
};
