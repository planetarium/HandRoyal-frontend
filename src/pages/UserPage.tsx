import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { getUserDocument, equipGloveDocument, USER_SUBSCRIPTION } from '../queries';
import { getGloveImage } from '../fetches';
import StyledButton from '../components/StyledButton';
import { useAccount } from '../context/AccountContext';
import { useNavigate } from 'react-router-dom';
import { MoveType } from '../gql/graphql';
import subscriptionClient from '../subscriptionClient';
import { Address } from '@planetarium/account';

const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT;

const UserPage: React.FC = () => {
  const { t } = useTranslation();
  const { userAddress } = useParams<{ userAddress: string }>();
  const { setPrivateKey, privateKey } = useAccount();
  const navigate = useNavigate();
  const [gloveImages, setGloveImages] = useState<{ [key: string]: string | null }>({});
  const [equippedGlove, setEquippedGlove] = useState<string | null>(null);

  const bytesToHex = (bytes: Uint8Array): string => {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ['getUser', userAddress],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getUserDocument, { address: userAddress });
      return response.stateQuery?.user || null;
    }
  });

  const queryClient = useQueryClient();
  const equipGloveMutation = useMutation({
    mutationFn: async (gloveId: string) => {
      if (!privateKey) throw new Error('Private key is missing');
      const privateKeyBytes = privateKey?.toBytes();
      const privateKeyHex = privateKeyBytes ? bytesToHex(privateKeyBytes) : undefined;
      await request(GRAPHQL_ENDPOINT, equipGloveDocument, { privateKey: privateKeyHex, gloveId: gloveId });
    },
    onSuccess: () => {
      if (userAddress) {
        queryClient.invalidateQueries({ queryKey: ['getUser', userAddress] });
      }
    },
  });

  useEffect(() => {
    const fetchImages = async () => {
      const images: { [key: string]: string | null } = {};

      const defaultResponse = await getGloveImage(null, MoveType.Paper);
      const defaultBlob = await defaultResponse.blob();
      images['0000000000000000000000000000000000000000'] = URL.createObjectURL(defaultBlob);

      if (data?.gloves) {
        for (const gloveId of data.gloves) {
          const response = await getGloveImage(gloveId, MoveType.Paper);
          const blob = await response.blob();
          images[gloveId] = URL.createObjectURL(blob);
        }
      }
      setGloveImages(images);
    };

    fetchImages();
  }, [data]);

  useEffect(() => {
    if (data) {
      setEquippedGlove(data.equippedGlove);
    }
  }, [data]);

  if (isLoading) return <p>{t('loading')}</p>;
  if (error) return <p>{t('error')}: {error.message}</p>;

  const user = data;

  const gloveIds = ['0000000000000000000000000000000000000000', ...(user?.gloves || [])];

  const handleGloveClick = (gloveId: string) => {
    if (!user || !userAddress) return;
    equipGloveMutation.mutate(gloveId);
    const unsubscribe = subscriptionClient.subscribe(
      {
        query: USER_SUBSCRIPTION,
        variables: { userId: userAddress },
      },
      {
        next: (result: any) => {
          if (Address.fromHex(result.data.onUserChanged.id).equals(Address.fromHex(userAddress))) {
            setEquippedGlove(result.data.onUserChanged.equippedGlove);
            unsubscribe();
          }
        },
        error: (err: any) => {
          console.error('Subscription error:', err);
        },
        complete: () => {
          console.log('Subscription completed');
        },
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('User Page')}</h1>
      {user ? (
        <>
          <p className="mb-2 text-lg font-semibold">{t('User ID')}: {user.id}</p>
          <div className="grid grid-cols-3 gap-4">
            {gloveIds.map(gloveId => (
              <div key={gloveId} className={`relative w-32 h-32 ${gloveId?.toLowerCase() === equippedGlove?.toLowerCase() ? 'border-4 border-red-500' : ''}`}
                onClick={() => handleGloveClick(gloveId)}
              >
                <img src={gloveImages[gloveId] || '/path/to/placeholder.png'} alt={gloveId !== '0x0000...' ? `Glove ${gloveId}` : 'Default Glove'} className="w-full h-full object-cover rounded-md" />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100">
                  <span className="text-white text-center whitespace-normal break-words p-2 overflow-hidden">{gloveId}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-red-500">{t('User not found')}</p>
      )}
    </div>
  );
};

export default UserPage;