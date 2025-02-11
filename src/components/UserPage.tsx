import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { graphql } from '../gql/gql';
import { request } from 'graphql-request';
import { useParams } from 'react-router-dom';

const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT;

const getUserDocument = graphql(/* GraphQL */ `
  query GetUser($userAddress: Address!) {
    stateQuery {
      user(userAddress: $userAddress) {
        id
        gloves
      }
    }
  }
`);

const UserPage: React.FC = () => {
  const { t } = useTranslation();
  const { userAddress } = useParams<{ userAddress: string }>();

  const { data, error, isLoading } = useQuery<{ stateQuery: { user: { id: string; gloves: string[] } } }>({
    queryKey: ['getUser', userAddress],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getUserDocument, { userAddress });
      return response as { stateQuery: { user: { id: string; gloves: string[] } } };
    }
  });

  if (isLoading) return <p>{t('loading')}</p>;
  if (error) return <p>{t('error')}: {error.message}</p>;

  const user = data?.stateQuery.user;

  return (
    <div className="user-page p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('User Page')}</h1>
      {user ? (
        <>
          <p className="mb-2 text-lg font-semibold">{t('User ID')}: {user.id}</p>
          <div className="bg-gray-100 p-4 rounded shadow">
            {user.gloves.length > 0 ? (
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2">{t('Glove ID')}</th>
                  </tr>
                </thead>
                <tbody>
                  {user.gloves.map((glove, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2">{glove}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">{t('No gloves found')}</p>
            )}
          </div>
        </>
      ) : (
        <p className="text-red-500">{t('User not found')}</p>
      )}
    </div>
  );
};

export default UserPage;