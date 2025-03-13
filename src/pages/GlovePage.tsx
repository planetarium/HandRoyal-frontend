import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { getGloveDocument } from '../queries';
import StyledButton from '../components/StyledButton';
import { getGloveImage } from '../fetches';
import { MoveType } from '../gql/graphql';
const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT;

const GlovePage: React.FC = () => {
  const { gloveId } = useParams<{ gloveId: string }>();
  const [images, setImages] = useState<{ [key: string]: string | null }>({
    ROCK: null,
    SCISSORS: null,
    PAPER: null,
  });
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data, error, isLoading } = useQuery({
    queryKey: ['getGlove', gloveId],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getGloveDocument, { gloveId });
      return response.stateQuery?.glove || null;
    }
  });

  useEffect(() => {
    if (gloveId) {
      [MoveType.Rock, MoveType.Scissors, MoveType.Paper].forEach(hand => {
        getGloveImage(gloveId, hand)
          .then(response => response.blob())
          .then(blob => {
            const url = URL.createObjectURL(blob);
            setImages(prevImages => ({ ...prevImages, [hand]: url }));
          })
          .catch(err => console.error(`Failed to fetch ${hand} image:`, err));
      });
    }
  }, [gloveId]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const glove = data;

  return (
    <div className="flex flex-col items-center justify-center w-full mx-auto bg-gray-700 rounded-lg border border-black">
      <div className="flex flex-col items-center p-4 w-full mx-auto bg-gray-900 rounded-t-lg border-b border-black">
        <h1
          className="text-4xl text-white font-bold"
          style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}
        >
          {t('gloveInfo')}
        </h1>
      </div>
      <div className="flex flex-col items-center p-4 w-full mx-auto text-white">
        {glove ? (
          <>
            <div className="flex space-x-4 mb-8">
              {['ROCK', 'SCISSORS', 'PAPER'].map(hand => (
                images[hand] && <img key={hand} alt={`${hand} Glove`} className="w-1/3 h-auto rounded-md" src={images[hand]} />
              ))}
            </div>
            <p className="mb-2 text-md">{t('gloveId')}: {glove.id}</p>
            <p className="mb-2 text-md">{t('gloveAuthor')}: {glove.author}</p>
          </>
        ) : (
          <p className="text-red-500">{t('gloveNotFound')}</p>
        )}
        <StyledButton onClick={() => navigate(-1)}>
          {t('goBack')}
        </StyledButton>
      </div>
    </div>
  );
};

export default GlovePage;