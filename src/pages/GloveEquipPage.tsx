import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { useEquippedGlove } from '../context/EquippedGloveContext';
import { getUserDocument } from '../queries';
import { getGloveImage } from '../fetches';
import { GRAPHQL_ENDPOINT } from '../queries';
import { MoveType } from '../gql/graphql';
import { useAccount } from '../context/AccountContext';
import AddressDisplay from '../components/AddressDisplay';

const GloveEquipPage: React.FC = () => {
  const { setEquippedGlove, equippedGlove } = useEquippedGlove();
  const navigate = useNavigate();
  const account = useAccount();
  const [gloveImages, setGloveImages] = useState<{ [key: string]: string | null }>({});
  const [gloveCounts, setGloveCounts] = useState<{ [key: string]: number }>({});

  const { data, error, isLoading } = useQuery({
    queryKey: ['getUser', account],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getUserDocument, { address: account?.address.toString() });
      return response?.stateQuery?.user;
    },
    enabled: !!account,
  });

  useEffect(() => {
    const fetchImages = async () => {
      const defaultGloveId = '0000000000000000000000000000000000000000';
      const defaultImageResponse = await getGloveImage(defaultGloveId, MoveType.Paper);
      const defaultBlob = await defaultImageResponse.blob();
      const defaultImageUrl = URL.createObjectURL(defaultBlob);
      setGloveImages(prev => ({ ...prev, [defaultGloveId]: defaultImageUrl }));

      if (data?.ownedGloves) {
        const counts: { [key: string]: number } = {};
        data.ownedGloves.forEach((gloveId: string) => {
          counts[gloveId] = (counts[gloveId] || 0) + 1;
        });
        setGloveCounts(counts);

        const uniqueGloveIds = Object.keys(counts);
        const images = await Promise.all(uniqueGloveIds.map(async (gloveId: string) => {
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
    navigate(`/user/${account?.address.toString()}`);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <div className={`flex flex-col items-center p-2 border-2 ${equippedGlove === '0000000000000000000000000000000000000000' ? 'border-red-500' : 'border-gray-300'}`}>
        <img src={gloveImages['0000000000000000000000000000000000000000'] || 'defaultImage.png'} alt="Default Glove" className="w-32 h-32 object-cover cursor-pointer" onClick={() => handleEquipGlove('0000000000000000000000000000000000000000')} />
        <AddressDisplay address={'0000000000000000000000000000000000000000'} type="glove" className="mt-2" />
      </div>
      {Object.keys(gloveCounts).map((gloveId: string) => (
        <div key={gloveId} className={`relative flex flex-col items-center p-2 border-2 ${equippedGlove === gloveId ? 'border-red-500' : 'border-gray-300'}`}>
          <img src={gloveImages[gloveId] || ''} alt="Glove" className="w-32 h-32 object-cover cursor-pointer" onClick={() => handleEquipGlove(gloveId)} />
          <AddressDisplay address={gloveId} type="glove" className="mt-2" />
          <span className="absolute bottom-0 right-0 bg-white text-black text-xs rounded-full px-1">{gloveCounts[gloveId]}</span>
        </div>
      ))}
    </div>
  );
};

export default GloveEquipPage;