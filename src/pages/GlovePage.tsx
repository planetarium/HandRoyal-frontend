import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StyledButton from '../components/StyledButton';
import { getLocalGloveImage } from '../fetches';

const GlovePage: React.FC = () => {
  const [images, setImages] = useState<{ [key: string]: string | null }>({
    ROCK: null,
    SCISSORS: null,
    PAPER: null,
  });
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { gloveId } = useParams<{ gloveId: string }>();

  return (
    <div className="flex flex-col items-center justify-center w-full mx-auto bg-gray-700 rounded-lg border border-black">
      <div className="flex flex-col items-center p-4 w-full mx-auto bg-gray-900 rounded-t-lg border-b border-black">
        <h1
          className="text-4xl text-white font-bold"
          style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}
        >
          {t('ui:gloveInfo')}
        </h1>
      </div>
      <div className="flex flex-col items-center p-4 w-full mx-auto text-white">
        <div className="flex space-x-4 mb-8">
            <img key={gloveId} alt={`${gloveId} Glove`} className="max-w-96 h-auto" src={getLocalGloveImage(gloveId ?? '')} />
        </div>
        <p className="mb-2 text-2xl">{t(`glove:${gloveId}.name`)}</p>
        <p className="mb-2 text-sm">{t('ui:glovetype')}: {t(`glove:${gloveId}.type`)}</p>
        <p className="mb-2 text-sm">{t('ui:damage')}: {t(`glove:${gloveId}.damage`)}</p>
        <p className="mb-2 text-md">{t(`glove:${gloveId}.description`)}</p>
      </div>
      <div className="flex flex-col items-center p-4 w-full mx-auto">
        <StyledButton onClick={() => navigate(-1)}>
          {t('ui:goBack')}
        </StyledButton>
      </div>
    </div>
  );
};

export default GlovePage;