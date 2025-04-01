import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getRanking, getMyRanking } from '../fetches';
import { useAccount } from '../context/AccountContext';

interface Player {
  address: string;
  wins: number;
  losses: number;
}

interface PlayerRank {
  rank: number;
  player: Player;
}

const RankingPage: React.FC = () => {
  const { t } = useTranslation();
  const account = useAccount();

  const { data: myRankData, isLoading: isMyRankLoading } = useQuery({
    queryKey: ['myRank', account?.address],
    queryFn: async () => {
      if (!account?.address) return null;
      const response = await getMyRanking(account.address.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch my ranking data');
      }
      return response.json() as Promise<PlayerRank>;
    },
    enabled: !!account?.address
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['ranking'],
    queryFn: async () => {
      const response = await getRanking();
      if (!response.ok) {
        throw new Error('Failed to fetch ranking data');
      }
      return response.json() as Promise<PlayerRank[]>;
    }
  });

  if (isLoading) return <div className="text-center py-8">로딩 중...</div>;
  if (error) return <div className="text-center py-8 text-red-600">에러가 발생했습니다: {(error as Error).message}</div>;

  const renderPlayerRow = (playerRank: PlayerRank) => {
    const { rank, player } = playerRank;
    const totalGames = player.wins + player.losses;
    const winRate = totalGames > 0 
      ? ((player.wins / totalGames) * 100).toFixed(1) 
      : '0.0';

    const displayAddress = player.address.startsWith('0x') 
      ? player.address 
      : `0x${player.address}`;

    return (
      <tr key={player.address} className="hover:bg-gray-50">
        <td className="px-6 py-4 border-b font-medium">{rank}</td>
        <td className="px-6 py-4 border-b font-mono text-sm">
          {displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}
        </td>
        <td className="px-6 py-4 border-b text-center text-green-600">
          {player.wins}
        </td>
        <td className="px-6 py-4 border-b text-center text-red-600">
          {player.losses}
        </td>
        <td className="px-6 py-4 border-b text-center">
          {winRate}%
        </td>
      </tr>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full mx-auto bg-gray-700 rounded-lg border border-black">
      <div className="flex flex-col items-center p-4 w-full mx-auto bg-gray-900 rounded-t-lg border-b border-black">
        <h1
          className="text-4xl text-white font-bold"
          style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}
        >
          {t('ui:ranking')}
        </h1>
      </div>
      <div className="flex flex-col items-center p-4 w-full mx-auto">
        {account && myRankData && (
          <div className="w-full mb-8">
            <h2 className="text-2xl text-white mb-4">{t('ui:myRanking')}</h2>
            <div className="overflow-x-auto w-full">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-3 border-b text-left text-gray-700">{t('ui:rank')}</th>
                    <th className="px-6 py-3 border-b text-left text-gray-700">{t('ui:address')}</th>
                    <th className="px-6 py-3 border-b text-center text-gray-700">{t('ui:wins')}</th>
                    <th className="px-6 py-3 border-b text-center text-gray-700">{t('ui:losses')}</th>
                    <th className="px-6 py-3 border-b text-center text-gray-700">{t('ui:winRate')}</th>
                  </tr>
                </thead>
                <tbody>
                  {renderPlayerRow(myRankData)}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="w-full">
          <h2 className="text-2xl text-white mb-4">{t('ui:topRanking')}</h2>
          <div className="overflow-x-auto w-full">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 border-b text-left text-gray-700">{t('ui:rank')}</th>
                  <th className="px-6 py-3 border-b text-left text-gray-700">{t('ui:address')}</th>
                  <th className="px-6 py-3 border-b text-center text-gray-700">{t('ui:wins')}</th>
                  <th className="px-6 py-3 border-b text-center text-gray-700">{t('ui:losses')}</th>
                  <th className="px-6 py-3 border-b text-center text-gray-700">{t('ui:winRate')}</th>
                </tr>
              </thead>
              <tbody>
                {data?.map(renderPlayerRow)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingPage;