import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { getUserDocument } from '../queries';
import StyledButton from '../components/StyledButton';
import { useAccount } from '../context/AccountContext';
import { MoveType } from '../gql/graphql';
import AddressDisplay from '../components/AddressDisplay';

const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT;

const UserPage: React.FC = () => {
  const { t } = useTranslation();
  const { userAddress } = useParams<{ userAddress: string }>();
  const { account } = useAccount();
  const navigate = useNavigate();
  const { data, error, isLoading } = useQuery<{ stateQuery: { user: { id: string; registeredGloves: string[]; ownedGloves: string[]; equippedGlove: string[] } } }>({
    queryKey: ['getUser', userAddress],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getUserDocument, { address: userAddress });
      return response as { stateQuery: { user: { id: string; registeredGloves: string[]; ownedGloves: string[]; equippedGlove: string[] } } };
    }
  });

  const [currentOwnedPage, setCurrentOwnedPage] = React.useState(0);
  const [move, setMove] = React.useState<MoveType>(MoveType.Paper);
  const glovesPerPage = 10;
  const [currentRegisteredPage, setCurrentRegisteredPage] = React.useState(0);

  if (isLoading) return <p>{t('loading')}</p>;
  if (error) return <p>{t('error')}: {error.message}</p>;

  const user = data?.stateQuery.user;

  const handleBack = () => {
    navigate(-1);
  };

  const handleNextOwnedPage = () => {
    if (user && (currentOwnedPage + 1) * glovesPerPage < user.ownedGloves.length) {
      setCurrentOwnedPage(currentOwnedPage + 1);
    }
  };

  const handlePreviousOwnedPage = () => {
    if (currentOwnedPage > 0) {
      setCurrentOwnedPage(currentOwnedPage - 1);
    }
  };

  const handleNextRegisteredPage = () => {
    if (user && (currentRegisteredPage + 1) * glovesPerPage < user.registeredGloves.length) {
      setCurrentRegisteredPage(currentRegisteredPage + 1);
    }
  };

  const handlePreviousRegisteredPage = () => {
    if (currentRegisteredPage > 0) {
      setCurrentRegisteredPage(currentRegisteredPage - 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full mx-auto bg-gray-700 border-2 border-black rounded-lg text-white">
      <div className="w-full flex flex-col items-center bg-gray-900 p-4 rounded-t-lg border-b border-black">
        <h1 className="text-4xl font-bold" style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}>{t('userInfo')}</h1>
      </div>
      <div className="flex flex-col items-center p-4 space-y-4">
        {user ? (
          <>
            <div className="flex flex-col items-center">
              <img alt="Glove" className="w-64 h-64 rounded-full bg-gray-500 mb-4" src={move} />
              <div className="flex flex-row space-x-2">
                <button className={`p-1 rounded shadow cursor-pointer ${move === MoveType.Rock ? 'bg-gray-500 border-2 border-gray-400' : 'bg-gray-600'}`} onClick={() => {setMove(MoveType.Rock)}}>✊</button>
                <button className={`p-1 rounded shadow cursor-pointer ${move === MoveType.Paper ? 'bg-gray-500 border-2 border-gray-400' : ' bg-gray-600'}`} onClick={() => {setMove(MoveType.Paper)}}>✋</button>
                <button className={`p-1 rounded shadow cursor-pointer ${move === MoveType.Scissors ? 'bg-gray-500 border-2 border-gray-400' : 'bg-gray-600'}`} onClick={() => {setMove(MoveType.Scissors)}}>✌️</button>
              </div>
            </div>
            <p className="text-lg">{t('User ID')}: {user.id}</p>
            <div className="w-full">
              <div className="bg-gray-600 p-4 rounded shadow mb-4">
                <p className="text-lg">{t('ownedGloves')}</p>
                {user.ownedGloves.length > 0 ? (
                  <div className="flex flex-col gap-1 text-sm">
                    {user.ownedGloves.slice(currentOwnedPage * glovesPerPage, (currentOwnedPage + 1) * glovesPerPage).map((glove, index) => (
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
                <StyledButton disabled={(currentOwnedPage + 1) * glovesPerPage >= user.ownedGloves.length} onClick={handleNextOwnedPage}>
                  &gt;
                </StyledButton>
              </div>
            </div>
            <div className="w-full">
              <div className="flex flex-col bg-gray-600 p-4 rounded shadow mb-4">
                <p className="text-lg">{t('registeredGloves')}</p>
                {user.registeredGloves.length > 0 ? (
                  <div className="flex flex-col gap-1 text-sm">
                    {user.registeredGloves.slice(currentRegisteredPage * glovesPerPage, (currentRegisteredPage + 1) * glovesPerPage).map((glove, index) => (
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
                <StyledButton disabled={(currentRegisteredPage + 1) * glovesPerPage >= user.registeredGloves.length} onClick={handleNextRegisteredPage}>
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