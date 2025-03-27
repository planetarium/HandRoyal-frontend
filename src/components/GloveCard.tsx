import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getLocalGloveImage } from '../fetches';;

interface GloveCardProps {
  gloveId: string;
  count?: number;
}

const GloveCard: React.FC<GloveCardProps> = ({ gloveId, count = 1 }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 기본 이미지 경로
  const imagePath = getLocalGloveImage(gloveId);
  
  const handleClick = () => {
    navigate(`/glove/${gloveId}`);
  };

  return (
    <div 
      className="flex flex-col items-center justify-center bg-gray-800 p-2 rounded-lg border border-gray-600 hover:border-gray-400 cursor-pointer transition-all hover:shadow-lg"
      onClick={handleClick}
    >
      <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden mb-2">
        <img 
          alt={t(`glove:${gloveId}.name`)} 
          className="w-full h-full object-contain"
          src={imagePath}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/src/assets/gloves/0000000000000000000000000000000000000000.png';
          }}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-white truncate w-full max-w-[120px]">
          {t(`glove:${gloveId}.name`)}
        </p>
        <p className="text-xs text-gray-300">
          {t('ui:countOwned', { count })}
        </p>
      </div>
    </div>
  );
};

export default GloveCard; 