import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocalEffectImage } from '../fetches';
interface EffectDisplayProps {
  type: string;
  className?: string;
}

const EffectDisplay: React.FC<EffectDisplayProps> = ({ type, className = '' }) => {
  const { t } = useTranslation(['effects']);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<'center' | 'right'>('center');

  useEffect(() => {
    const updatePosition = () => {
      if (tooltipRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        // 툴팁이 왼쪽으로 나가는지 확인
        if (containerRect.left < tooltipRect.width / 2) {
          setTooltipPosition('right');
        } else {
          setTooltipPosition('center');
        }
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  // 이펙트 타입에 따른 이미지 매핑
  const getEffectImage = (effectType: string) => {
    const effectName = effectType.toLowerCase();
    return getLocalEffectImage(effectName);
  };

  // 이펙트 타입에 따른 설명 매핑
  const getEffectDescription = (effectType: string) => {
    switch (effectType) {
      case 'BURN':
        return {
          name: t('effects:burn.name'),
          description: t('effects:burn.description')
        };
      default:
        return {
          name: t('effects:burn.name'),
          description: t('effects:burn.description')
        };
    }
  };

  const effect = getEffectDescription(type);

  return (
    <div ref={containerRef} className="relative group">
      <img
        alt={effect.name}
        className={`w-6 h-6 ${className}`}
        src={getEffectImage(type)}
      />
      <div className="fixed">
        <div 
          ref={tooltipRef}
          className={`absolute bottom-full z-50 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 min-w-[120px] max-w-[200px] whitespace-normal ${
            tooltipPosition === 'center' 
              ? 'left-1/2 transform -translate-x-1/2' 
              : 'left-0'
          }`}
          style={{
            bottom: '100%',
            left: tooltipPosition === 'center' ? '50%' : '0',
            transform: tooltipPosition === 'center' ? 'translateX(-50%)' : 'none'
          }}
        >
          <div className="font-semibold mb-1">{effect.name}</div>
          <div className="text-gray-300">{effect.description}</div>
        </div>
      </div>
    </div>
  );
};

export default EffectDisplay;
