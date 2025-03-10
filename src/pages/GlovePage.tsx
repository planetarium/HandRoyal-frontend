import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { getGloveDocument } from '../queries';

const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT;
const GLOVE_API_URL = import.meta.env.VITE_GLOVE_API_URL;

const GlovePage: React.FC = () => {
  const { gloveId } = useParams<{ gloveId: string }>();
  const [images, setImages] = useState<{ [key: string]: string | null }>({
    rock: null,
    scissors: null,
    paper: null,
  });

  const { data, error, isLoading } = useQuery({
    queryKey: ['getGlove', gloveId],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getGloveDocument, { gloveId });
      return response.stateQuery?.glove || null;
    }
  });

  useEffect(() => {
    if (gloveId) {
      ['rock', 'scissors', 'paper'].forEach(hand => {
        fetch(`${GLOVE_API_URL}/get-glove-image?gloveAddress=${gloveId}&hand=${hand}`)
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
          Glove Information
        </h1>
      </div>
      <div className="flex flex-col items-center p-4 w-full mx-auto text-white">
        {glove ? (
          <>
            <div className="flex flex-row justify-between">
              <img alt="rock" className="w-1/3 h-auto" src={images['rock'] ?? undefined} />
              <img alt="scissors" className="w-1/3 h-auto" src={images['scissors'] ?? undefined} />
              <img alt="paper" className="w-1/3 h-auto" src={images['paper'] ?? undefined} />
            </div>
            <p className="mb-2 text-md">Glove ID: {glove.id}</p>
            <p className="mb-2 text-md">Author: {glove.author}</p>
            <div className="flex space-x-4">
              {['rock', 'scissors', 'paper'].map(hand => (
                images[hand] && <img key={hand} alt={`${hand} Glove`} className="w-1/3 h-auto rounded-md" src={images[hand]} />
              ))}
            </div>
          </>
        ) : (
          <p className="text-red-500">Glove not found</p>
        )}
      </div>
    </div>
  );
};

export default GlovePage;