import React, { useEffect, useState } from 'react';
import { useEquippedGlove } from '../context/EquippedGloveContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { getUserDocument } from '../queries';
import { getGloveImage } from '../fetches';
import { GRAPHQL_ENDPOINT } from '../queries';
import { MoveType } from '../gql/graphql';
import { useAccount } from '../context/AccountContext';
import AddressDisplay from '../components/AddressDisplay';

const GloveEquipPage: React.FC = () => {
  const { setEquippedGlove, equippedGlove } = useEquippedGlove();
  const navigate = useNavigate();
  const { address } = useAccount();
  const [gloveImages, setGloveImages] = useState<{ [key: string]: string | null }>({});

  const { data, error, isLoading } = useQuery({
    queryKey: ['getUser', address],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getUserDocument, { address: address?.toString() });
      return response?.stateQuery?.user;
    },
    enabled: !!address,
  });

  useEffect(() => {
    const fetchImages = async () => {
      const defaultGloveId = '0000000000000000000000000000000000000000';
      const defaultImageResponse = await getGloveImage(defaultGloveId, MoveType.Paper);
      const defaultBlob = await defaultImageResponse.blob();
      const defaultImageUrl = URL.createObjectURL(defaultBlob);
      setGloveImages(prev => ({ ...prev, [defaultGloveId]: defaultImageUrl }));

      if (data?.ownedGloves) {
        const images = await Promise.all(data.ownedGloves.map(async (gloveId: string) => {
          const response = await getGloveImage(gloveId, MoveType.Paper);
          const blob = await response.blob();
          return { gloveId, imageUrl: URL.createObjectURL(blob) };
        }));
        const imageMap = images.reduce((acc, { gloveId, imageUrl }) => {
          acc[gloveId] = imageUrl;
          return acc;
        }, {} as { [key: string]: string });
        setGloveImages(prev => ({ ...prev, ...imageMap }));
      }
    };
    fetchImages();
  }, [data]);

  const handleEquipGlove = (gloveId: string) => {
    setEquippedGlove(gloveId);
    navigate(`/user/${address}`);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <div className={`flex flex-col items-center p-2 border-2 ${equippedGlove === '0000000000000000000000000000000000000000' ? 'border-red-500' : 'border-gray-300'}`}>
        <img src={gloveImages['0000000000000000000000000000000000000000'] || 'defaultImage.png'} alt="Default Glove" className="w-32 h-32 object-cover cursor-pointer" onClick={() => handleEquipGlove('0000000000000000000000000000000000000000')} />
        <AddressDisplay address={'0000000000000000000000000000000000000000'} type="glove" className="mt-2" />
      </div>
      {data?.ownedGloves?.map((gloveId: string) => (
        <div key={gloveId} className={`flex flex-col items-center p-2 border-2 ${equippedGlove === gloveId ? 'border-red-500' : 'border-gray-300'}`}>
          <img src={gloveImages[gloveId] || ''} alt="Glove" className="w-32 h-32 object-cover cursor-pointer" onClick={() => handleEquipGlove(gloveId)} />
          <AddressDisplay address={gloveId} type="glove" className="mt-2" />
        </div>
      ))}
    </div>
  );
};

export default GloveEquipPage; 