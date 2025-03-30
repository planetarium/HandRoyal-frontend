import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocalGloveImage } from '../fetches';
import type { GloveInfo } from '../gql/graphql';

export interface GloveSelection {
  [gloveId: string]: number; // 글러브 ID를 키로, 선택된 개수를 값으로 가지는 객체
}

interface GloveSelectionComponentProps {
  ownedGloves: GloveInfo[]; // 소유한 글러브 목록
  maxSelections: number; // 최대 선택 가능 개수
  selectedGloves: GloveSelection; // 현재 선택된 글러브
  setSelectedGloves: React.Dispatch<React.SetStateAction<GloveSelection>>; // 선택 상태 업데이트 함수
  totalSelected: number; // 현재 총 선택된 개수
  setTotalSelected: React.Dispatch<React.SetStateAction<number>>; // 총 선택 개수 업데이트 함수
}

const GloveSelectionComponent: React.FC<GloveSelectionComponentProps> = ({
  ownedGloves,
  maxSelections,
  selectedGloves,
  setSelectedGloves,
  totalSelected,
  setTotalSelected
}) => {
  const { t } = useTranslation();
  const [gloveImages, setGloveImages] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchGloveImages = async () => {
      if (ownedGloves && ownedGloves.length > 0) {
        const images: { [key: string]: string } = {};
        
        for (const info of ownedGloves) {
          try {
            images[info.id] = getLocalGloveImage(info.id);
          } catch (error) {
            console.error(`Failed to load image for glove ${info.id}:`, error);
          }
        }
        
        setGloveImages(images);
      }
    };
    
    fetchGloveImages();
  }, [ownedGloves]);

  const handleGloveClick = (gloveId: string) => {
    if (totalSelected >= maxSelections && maxSelections > 0) {
      // 이미 최대 선택 개수에 도달했을 경우
      return;
    }

    setSelectedGloves(prev => {
      const currentCount = prev[gloveId] || 0;
      const availableCount = ownedGloves?.find(g => g.id === gloveId)?.count || 0;
      
      // 해당 글러브의 최대 개수에 도달한 경우
      if (currentCount >= availableCount) {
        return prev;
      }
      
      const newCount = currentCount + 1;
      const newSelected = { ...prev, [gloveId]: newCount };
      
      // 총 선택 개수 업데이트
      setTotalSelected(Object.values(newSelected).reduce((sum, count) => sum + count, 0));
      
      return newSelected;
    });
  };

  const resetSelections = () => {
    setSelectedGloves({});
    setTotalSelected(0);
  };

  if (!ownedGloves || ownedGloves.length === 0) {
    return <p className="text-center text-white">{t('ui:noGlovesOwned')}</p>;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">{t('ui:selectGloves')}</h2>
        {totalSelected > 0 && (
          <button
            className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded"
            onClick={resetSelections}
          >
            {t('ui:reset')}
          </button>
        )}
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white">
            {maxSelections > 0 ? 
              t('ui:selectableGloves', { count: maxSelections }) :
              t('ui:selectableGloves')}
          </span>
          <span className="text-white">
            {maxSelections > 0 ? 
              `${totalSelected} / ${maxSelections}` :
              `${totalSelected}`}
          </span>
        </div>
        {maxSelections > 0 && (
          <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-yellow-400 h-full transition-all duration-300"
              style={{ width: `${(totalSelected / maxSelections) * 100}%` }}
            />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {ownedGloves.map((gloveInfo) => {
          const gloveId = gloveInfo.id;
          const count = gloveInfo.count || 0;
          const selectedCount = selectedGloves[gloveId] || 0;

          return (
            <div
              key={gloveId} 
              className={`bg-gray-800 rounded-lg p-4 shadow-md cursor-pointer transition-all ${
                selectedCount > 0 
                  ? 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/50' 
                  : 'hover:shadow-lg hover:bg-gray-700'
              }`}
              onClick={() => handleGloveClick(gloveId)}
            >
              <div className="relative">
                <img 
                  alt={`Glove ${gloveId}`} 
                  className="w-full h-40 object-contain mb-2" 
                  src={gloveImages[gloveId] || 'placeholder.png'}
                />
              </div>
              <p className="text-center text-white text-sm mt-2 truncate">{t(`glove:${gloveId}.name`)}</p>
              <div className="flex justify-center mt-2">
                {[...Array(count)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-4 h-4 mx-1 rounded-full border-2 transition-all duration-300 ${
                      i < selectedCount 
                        ? 'border-yellow-400 bg-yellow-400 shadow-md shadow-yellow-400/50 scale-110' 
                        : 'border-gray-300 bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GloveSelectionComponent; 