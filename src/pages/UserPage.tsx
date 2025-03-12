import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { getUserDocument, USER_SUBSCRIPTION } from '../queries';
import { getGloveImage } from '../fetches';
import StyledButton from '../components/StyledButton';
import { useAccount } from '../context/AccountContext';
import { useNavigate } from 'react-router-dom';
import { MoveType } from '../gql/graphql';
import subscriptionClient from '../subscriptionClient';
import { Address } from '@planetarium/account';
import AddressDisplay from '../components/AddressDisplay';
import { useEquippedGlove } from '../context/EquippedGloveContext';

const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT;

const UserPage: React.FC = () => {
  const { t } = useTranslation();
  const { account } = useAccount();
  const navigate = useNavigate();
  const [gloveImages, setGloveImages] = useState<{ [key: string]: string | null }>({});
  const { equippedGlove, setEquippedGlove } = useEquippedGlove();

  const bytesToHex = (bytes: Uint8Array): string => {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ['getUser', account],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getUserDocument, { address: account?.address.toString() });
      return response?.stateQuery?.user;
    }
  });

  const [currentOwnedPage, setCurrentOwnedPage] = React.useState(0);
  const [move, setMove] = React.useState<MoveType>(MoveType.Paper);
  const glovesPerPage = 10;
  const [currentRegisteredPage, setCurrentRegisteredPage] = React.useState(0);

  useEffect(() => {
    const fetchGloveImage = async () => {
      if (equippedGlove) {
        const response = await getGloveImage(equippedGlove, move);
        const blob = await response.blob();
        setGloveImages(prev => ({ ...prev, [equippedGlove]: URL.createObjectURL(blob) }));
      }
    };
    fetchGloveImage();
  }, [equippedGlove, move]);

  if (isLoading) return <p>{t('loading')}</p>;
  if (error) return <p>{t('error')}: {error.message}</p>;

  const handleBack = () => {
    navigate(-1);
  };

  const handleNextOwnedPage = () => {
    if (data && data.ownedGloves && (currentOwnedPage + 1) * glovesPerPage < data.ownedGloves.length) {
      setCurrentOwnedPage(currentOwnedPage + 1);
    }
  };

  const handlePreviousOwnedPage = () => {
    if (currentOwnedPage > 0) {
      setCurrentOwnedPage(currentOwnedPage - 1);
    }
  };

  const handleNextRegisteredPage = () => {
    if (data && data.registeredGloves && (currentRegisteredPage + 1) * glovesPerPage < data.registeredGloves.length) {
      setCurrentRegisteredPage(currentRegisteredPage + 1);
    }
  };

  const handlePreviousRegisteredPage = () => {
    if (currentRegisteredPage > 0) {
      setCurrentRegisteredPage(currentRegisteredPage - 1);
    }
  }

  const handleGloveClick = (gloveId: string) => {
    if (!data || !account) return;
    const unsubscribe = subscriptionClient.subscribe(
      {
        query: USER_SUBSCRIPTION,
        variables: { userId: account.address.toString() },
      },
      {
        next: (result: any) => {
          if (Address.fromHex(result.data.onUserChanged.id).equals(account.address)) {
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
    <div className="flex flex-col items-center justify-center w-full mx-auto bg-gray-700 border-2 border-black rounded-lg text-white">
      <div className="w-full flex flex-col items-center bg-gray-900 p-4 rounded-t-lg border-b border-black">
        <h1 className="text-4xl font-bold" style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}>{t('userInfo')}</h1>
      </div>
      <div className="flex flex-col items-center p-4 space-y-4">
        {data ? (
          <>
            <div className="flex flex-col items-center">
              <img alt="Glove" className="w-64 h-64 rounded-full bg-gray-500 mb-4 cursor-pointer" src={equippedGlove ? gloveImages[equippedGlove] || move : move} onClick={() => navigate('/gloveEquip')} />
              <div className="flex flex-row space-x-2">
                <button className={`p-1 rounded shadow cursor-pointer ${move === MoveType.Rock ? 'bg-gray-500 border-2 border-gray-400' : 'bg-gray-600'}`} onClick={() => {setMove(MoveType.Rock)}}>✊</button>
                <button className={`p-1 rounded shadow cursor-pointer ${move === MoveType.Paper ? 'bg-gray-500 border-2 border-gray-400' : ' bg-gray-600'}`} onClick={() => {setMove(MoveType.Paper)}}>✋</button>
                <button className={`p-1 rounded shadow cursor-pointer ${move === MoveType.Scissors ? 'bg-gray-500 border-2 border-gray-400' : 'bg-gray-600'}`} onClick={() => {setMove(MoveType.Scissors)}}>✌️</button>
              </div>
            </div>
            <p className="text-lg">{t('User ID')}: {data.id}</p>
            <div className="w-full">
              <div className="bg-gray-600 p-4 rounded shadow mb-4">
                <p className="text-lg">{t('ownedGloves')}</p>
                {data.ownedGloves && data.ownedGloves.length > 0 ? (
                  <div className="flex flex-col gap-1 text-sm">
                    {data.ownedGloves.slice(currentOwnedPage * glovesPerPage, (currentOwnedPage + 1) * glovesPerPage).map((glove, index) => (
                      <AddressDisplay key={index} address={glove} type="glove"/>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">{t('noGlovesFound')}</p>
                )}
              </div>
              <div className="flex justify-center space-x-6">
                <StyledButton disabled={currentOwnedPage === 0} onClick={handlePreviousOwnedPage}>
                  &lt;
                </StyledButton>
                <StyledButton disabled={(currentOwnedPage + 1) * glovesPerPage >= (data.ownedGloves ? data.ownedGloves.length : 0)} onClick={handleNextOwnedPage}>
                  &gt;
                </StyledButton>
              </div>
            </div>
            <div className="w-full">
              <div className="flex flex-col bg-gray-600 p-4 rounded shadow mb-4">
                <p className="text-lg">{t('registeredGloves')}</p>
                {data.registeredGloves && data.registeredGloves.length > 0 ? (
                  <div className="flex flex-col gap-1 text-sm">
                    {data.registeredGloves.slice(currentRegisteredPage * glovesPerPage, (currentRegisteredPage + 1) * glovesPerPage).map((glove, index) => (
                      <AddressDisplay key={index} address={glove} type="glove"/>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">{t('noGlovesFound')}</p>
                )}
              </div>
              <div className="flex justify-center space-x-6">
                <StyledButton disabled={currentRegisteredPage === 0} onClick={handlePreviousRegisteredPage}>
                  &lt;
                </StyledButton>
                <StyledButton disabled={(currentRegisteredPage + 1) * glovesPerPage >= (data.registeredGloves ? data.registeredGloves.length : 0)} onClick={handleNextRegisteredPage}>
                  &gt;
                </StyledButton>
              </div>
            </div>
            <StyledButton onClick={handleBack}>
              {t('goBack')}
            </StyledButton>
          </>
        ) : (
          <p className="text-red-500">{t('User not found')}</p>
        )}
      </div>
    </div>
  );
};

export default UserPage;