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
    <div className="glove-page p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Glove Information</h1>
      {glove ? (
        <>
          <p className="mb-2 text-lg font-semibold">Glove ID: {glove.id}</p>
          <p className="mb-2 text-lg font-semibold">Author: {glove.author}</p>
          <div className="flex space-x-4">
            {['rock', 'scissors', 'paper'].map(hand => (
              images[hand] && <img key={hand} src={images[hand]} alt={`${hand} Glove`} className="w-1/3 h-auto rounded-md" />
            ))}
          </div>
        </>
      ) : (
        <p className="text-red-500">Glove not found</p>
      )}
    </div>
  );
};

export default GlovePage;