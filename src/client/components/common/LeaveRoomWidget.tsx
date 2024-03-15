import { type FC } from 'react';
import { Link } from 'react-router-dom';

export const LeaveRoomWidget: FC = () => (
  <div>
    <div>
      <p>ルームから退出しました。</p>
    </div>
    <div>
      <Link to="/">最初に戻る</Link>
    </div>
  </div>
);
