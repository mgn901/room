import { type ChangeEventHandler, type FC, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { isShortSecret } from '../../../utils/random-values/TShortSecret.ts';
import { useWaitingRoomClient } from '../clientHooks.ts';

export const JoinWaitingRoomContainer: FC = () => {
  const params = useParams<'secret'>();
  const navigate = useNavigate();

  const waitingRoomClient = useWaitingRoomClient();

  const [secret, setSecret] = useState<string>(params.secret ?? '');
  const [validationError, setValidationError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (waitingRoomClient.waitingRoom !== undefined) {
      navigate('/waiting-rooms/room');
    }
  }, [navigate, waitingRoomClient.waitingRoom]);

  if (waitingRoomClient.waitingRoom !== undefined) {
    return <></>;
  }

  const handleChangeSecret: ChangeEventHandler<HTMLInputElement> = (event) => {
    setSecret(event.currentTarget.value);
  };

  const handleClickJoin = () => {
    if (!isShortSecret(secret)) {
      setValidationError('合言葉を正しく入力してください。');
      return;
    }
    setValidationError(undefined);
    waitingRoomClient.join({ secret });
  };

  return (
    <div>
      <h2>ルームに参加する</h2>

      <div>
        <label>
          <span>合言葉を入力してください。</span>
          <input
            type="string"
            value={secret}
            onChange={handleChangeSecret}
            disabled={waitingRoomClient.isProcessing}
          />
        </label>
        {validationError !== undefined && !waitingRoomClient.isProcessing && (
          <p>{validationError}</p>
        )}
        {waitingRoomClient.error !== undefined && !waitingRoomClient.isProcessing && (
          <p>{waitingRoomClient.error.message}</p>
        )}
        <button type="button" onClick={handleClickJoin} disabled={waitingRoomClient.isProcessing}>
          参加する
        </button>
      </div>

      <div>
        <Link to="/">最初に戻る</Link>
      </div>
    </div>
  );
};
