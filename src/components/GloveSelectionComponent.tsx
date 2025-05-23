import React from 'react';
import { useTranslation } from 'react-i18next';
import GloveCard from './GloveCard';
import type_rock from '../assets/type_rock.png';
import type_paper from '../assets/type_paper.png';
import type_scissors from '../assets/type_scissors.png';
import type_special from '../assets/type_special.png';
import { GetGloveType } from '../utils/gloveUtils';
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

  const handleGloveClick = (gloveId: string) => {
    if (totalSelected >= maxSelections && maxSelections > 0) {
      // 이미 최대 선택 개수에 도달했을 경우
      return;
    }

    setSelectedGloves(prev => {
      const currentCount = prev[gloveId] || 0;
      const availableCount = ownedGloves?.find(g => g.id === gloveId)?.count || 0;
      
      // 해당 글러브의 최대 개수(3개)에 도달한 경우
      if (currentCount >= Math.min(3, availableCount)) {
        return prev;
      }
      
      const newCount = currentCount + 1;
      const newSelected = { ...prev, [gloveId]: newCount };
      
      // 총 선택 개수 업데이트
      setTotalSelected(Object.values(newSelected).reduce((sum, count) => sum + count, 0));
      
      return newSelected;
    });
  };

  const handleBubbleClick = (gloveId: string, index: number) => {
    setSelectedGloves(prev => {
      const currentCount = prev[gloveId] || 0;
      if (index >= currentCount) return prev;

      const newCount = currentCount - 1;
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

  // 타입별 선택 개수 계산
  const getTypeCounts = () => {
    const counts = {
      rock: 0,
      paper: 0,
      scissors: 0,
      special: 0
    };

    Object.entries(selectedGloves).forEach(([gloveId, count]) => {
      const glove = ownedGloves.find(g => g.id === gloveId);
      if (glove) {
        const type = GetGloveType(gloveId);
        switch (type) {
          case 'rock':
            counts.rock += count;
            break;
          case 'paper':
            counts.paper += count;
            break;
          case 'scissors':
            counts.scissors += count;
            break;
          case 'special':
            counts.special += count;
            break;
        }
      }
    });

    return counts;
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
      
      {/* 타입별 선택 개수 표시 */}
      <div className="flex flex-row items-center justify-center space-x-4 mb-6">
        {Object.entries(getTypeCounts()).map(([type, count]) => {
          const typeImage = {
            rock: type_rock,
            paper: type_paper,
            scissors: type_scissors,
            special: type_special
          }[type];

          return (
            <div key={type} className="flex items-center justify-center">
              <img alt={type} className="w-8 h-8 mr-2" src={typeImage} />
              <span className="text-white font-semibold">{count}</span>
            </div>
          );
        })}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {ownedGloves.map((gloveInfo) => {
          const gloveId = gloveInfo.id;
          const selectedCount = selectedGloves[gloveId] || 0;
          const maxCount = Math.min(3, gloveInfo.count || 0);

          return (
            <div
              key={gloveId}
              className={`cursor-pointer transition-all`}
              onClick={() => handleGloveClick(gloveId)}
            >
              <div className="flex flex-col items-center">
                <GloveCard 
                  count={maxCount}
                  disableClick={true}
                  gloveId={gloveId}
                />
                <div className="flex justify-center mt-2">
                  {[...Array(maxCount)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-4 h-4 mx-1 rounded-full border-2 transition-all duration-300 cursor-pointer ${
                        i < selectedCount 
                          ? 'border-yellow-400 bg-yellow-400 shadow-md shadow-yellow-400/50 scale-110' 
                          : 'border-gray-300 bg-transparent'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBubbleClick(gloveId, i);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GloveSelectionComponent; 