import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getLocalGloveImage } from '../fetches';
import { GetGloveType, GetGloveRarity } from '../utils/gloveUtils';
import type_rock from '../assets/type_rock.png';
import type_paper from '../assets/type_paper.png';
import type_scissors from '../assets/type_scissors.png';
import { ParseAddress } from '../utils/addressUtils';

interface GloveCardProps {
  gloveId: string;
  count?: number;
  disableClick?: boolean;
}

const GloveCard: React.FC<GloveCardProps> = ({ gloveId, count = 1, disableClick = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 0x로 시작하는 경우 앞 두 글자 제거
  const processedGloveId = ParseAddress(gloveId);

  // 기본 이미지 경로
  const imagePath = getLocalGloveImage(processedGloveId);
  
  // 글러브 타입과 등급 확인 - 유틸리티 함수 사용
  const gloveType = GetGloveType(gloveId);
  const gloveRarity = GetGloveRarity(gloveId);
  
  // 등급에 따른 테두리 색상 설정
  const getBorderColorClass = () => {
    switch (gloveRarity) {
      case 'common':
        return 'border-gray-400';
      case 'uncommon':
        return 'border-green-400';
      case 'rare':
        return 'border-blue-400';
      case 'epic':
        return 'border-purple-400';
      case 'legendary':
        return 'border-yellow-400';
      default:
        return 'border-gray-400';
    }
  };
  
  // 타입에 따른 이미지 가져오기
  const getTypeImage = () => {
    switch (gloveType) {
      case 'rock':
        return type_rock;
      case 'paper':
        return type_paper;
      case 'scissors':
        return type_scissors;
      case 'special':
        return type_rock; // special 타입은 임시로 rock 이미지 사용
      default:
        return type_rock;
    }
  };
  
  const handleClick = () => {
    if (!disableClick) {
      navigate(`/glove/${processedGloveId}`);
    }
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center bg-gray-800 p-2 rounded-lg border-2 ${getBorderColorClass()} hover:border-white ${disableClick ? '' : 'cursor-pointer'} transition-all hover:shadow-lg`}
      onClick={handleClick}
    >
      <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden mb-2 relative">
        <div className="absolute top-[-2px] left-[-2px] z-1">
          <img 
            alt={gloveType} 
            className="w-8 h-8" 
            src={getTypeImage()}
          />
        </div>
        <img 
          alt={t(`glove:${processedGloveId}.name`)} 
          className="w-full h-full object-contain"
          src={imagePath}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/src/assets/gloves/0000000000000000000000000000000000000000.png';
          }}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-white truncate w-full max-w-[120px]">
          {t(`glove:${processedGloveId}.name`)}
        </p>
        <p className="text-xs text-gray-300">
          {t('ui:countOwned', { count })}
        </p>
        <p className={`text-xs ${getBorderColorClass().replace('border-', 'text-')}`}>
          {gloveRarity}
        </p>
      </div>
    </div>
  );
};

export default GloveCard; 