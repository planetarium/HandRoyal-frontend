import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Clock, Crown, Trophy, Lock } from 'lucide-react';
import { SessionState } from '../gql/graphql';
import StyledButton from './StyledButton';
import AddressDisplay from './AddressDisplay';

interface SessionCardProps {
  id: string;
  host: string;
  prize: string;
  currentPlayers: number;
  maxPlayers: number;
  blocksLeft: number;
  state: SessionState;
  handleJoin: (id: string) => void;
  handleSpectate: (id: string) => void;
  prizeImage: string;
  isPrivate?: boolean;
  canJoin?: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({
  id,
  host,
  prize,
  currentPlayers,
  maxPlayers,
  blocksLeft,
  state,
  handleJoin,
  handleSpectate,
  prizeImage,
  isPrivate = false,
  canJoin = true
}) => {
  const { t } = useTranslation();

  // ID를 기반으로 색상 생성
  const generateColorFromId = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 80%)`; // HSL 색상으로 변환
    return color;
  };

  const backgroundColor = generateColorFromId(id);

  // 배경색의 밝기를 계산하여 텍스트 색상 결정
  const getTextColor = (hslColor: string) => {
    const [,, l] = hslColor.match(/\d+/g)!.map(Number);
    return l > 50 ? '#000000' : '#FFFFFF'; // 밝기가 50% 이상이면 검은색, 아니면 흰색
  };

  const textColor = getTextColor(backgroundColor);

  return (
    <div
      key={id}
      className="flex items-center p-3 pt-6 pb-6 rounded-lg w-full border-2 border-black"
      style={{
        background: `${backgroundColor}`,
        boxShadow: 'inset 0 4px 6px -4px rgba(255, 255, 255, 0.5)',
      }}
    >
      <div className="w-16 h-16 bg-gray-200 rounded-full mr-3 flex-shrink-0">
        <img alt="prize" className="w-full h-full object-cover rounded-full" src={prizeImage} />
      </div>
      <div className="flex flex-col flex-grow">
        <h3
          className="text-md font-extrabold text-white"
          style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}
        >
          {id}
        </h3>
        <div className="flex items-center text-xs mt-2" style={{ color: textColor }}>
          <Crown className="mr-1 h-4 w-4" />
          <AddressDisplay address={host} shorten={false} type='user' />
        </div>
        <div className="flex items-center text-xs mt-1" style={{ color: textColor }}>
          <Trophy className="mr-1 h-4 w-4" />
          <AddressDisplay address={prize} shorten={false} type='glove' />
        </div>
      </div>
      <div className="flex items-center space-x-3 flex-shrink-0">
        <div className={`flex text-sm items-center ${currentPlayers === maxPlayers ? 'text-red-700' : 'text-blue-700'}`}>
          <Users className="mr-1 h-4 w-4" strokeWidth={3} />
          <span>{currentPlayers}/{maxPlayers}</span>
        </div>
        {isPrivate && (
          <div className="flex text-sm items-center text-yellow-500">
            <Lock className="h-4 w-4" strokeWidth={3} />
          </div>
        )}
        {state === SessionState.Ready ? (
            <div
              className={`flex text-sm items-center mr-2 ${state === SessionState.Ready && blocksLeft <= 10 ? 'text-red-700' : 'text-gray-700'}`}
            >
            <Clock className="mr-1 h-4 w-4" strokeWidth={3} />
            <span>{`${blocksLeft}`}</span>
          </div>
        ) : null}
        {state === SessionState.Ready ? (
          <StyledButton
            bgColor = '#FFE55C'
            shadowColor = '#FF9F0A'
            disabled={
              (currentPlayers ?? maxPlayers) >= maxPlayers || 
              (isPrivate && !canJoin)
            }
            onClick={() => handleJoin(id)}
          >
            {t('join')}
          </StyledButton>
        ) : (
          <StyledButton textColor={textColor} onClick={() => handleSpectate(id)}>
            {t('spectate')}
          </StyledButton>
        )}
      </div>
    </div>
  );
};

export default SessionCard; 