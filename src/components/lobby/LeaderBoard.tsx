/**
 * Leaderboard Component
 * * Displays the top ranking players based on their points and wins.
 * Includes rank progression visualization and skeleton loading states.
 */
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { useLeaderboard, getUserRank } from '@/hooks/queries/useUserProfile';
import { Badge, Crown, Medal, Trophy } from 'lucide-react';
import Image from 'next/image';

/**
 * Skeleton loader for leaderboard rows
 */
const LeaderboardSkeleton: React.FC = () => (
  <div className="space-y-3 animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center gap-4 p-3 border border-naval-border rounded-md">
        <div className="w-8 h-8 bg-naval-border rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-naval-border rounded w-1/3" />
          <div className="h-3 bg-naval-border rounded w-1/4" />
        </div>
        <div className="w-12 h-6 bg-naval-border rounded" />
      </div>
    ))}
  </div>
);

/**
 * Individual Leaderboard Row Component
 */
interface PlayerRowProps {
  rankNumber: number;
  username: string;
  points: number;
  wins: number;
  isTopThree?: boolean;
}

const PlayerRow: React.FC<PlayerRowProps> = ({ rankNumber, username, points, wins, isTopThree }) => {
  const rankInfo = getUserRank(wins);

  // Highlight colors for top 3
  const rankColors = [
    'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20', // 1st
    'bg-slate-400 text-slate-900',   // 2nd
    'bg-amber-700 text-amber-100',  // 3rd
  ];

  return (
    <div className={`flex p-2  gap-3 p-2 m-auto rounded-2xl  border  ${isTopThree
      ? 'bg-naval-action/10 border-naval-action/30 shadow-[inset_0_0_10px_rgba(var(--naval-action-rgb),0.1)]'
      : 'bg-naval-bg border-naval-border hover:border-naval-action/50'
      }`}>
      {/* Rank Position Badge */}
      <div className={`flex items-center justify-center  w-12 h-12 rounded-2xl  font-bold text-m 
      ${isTopThree ? rankColors[rankNumber - 1] : 'bg-slate-800 text-slate-500'
        }`
      }>
        
        {rankNumber}
      </div>
       <div className={`h-10 w-10 gap-2 ${
        rankNumber==1 ?'" border-2 border-amber-500':'border-2 border-slate-700'
      }`}>
        <div className="bg-slate-800 text-slate-400">
                          <Image src="/mortyy.jpg" alt="" width={250} height={150} className="border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]"></Image></div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-5 mr-5 justify-between">
          <span className={`font-bold truncate ${
            rankNumber==1 ? "text-amber-400": "text-white"
          }`}>
            {username}
          </span>
          <span className="font-mono text-cyan-400 font-bold">{points}PTS</span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
          <span className="flex items-center gap-1 text-amber-500/80 ">
            <Medal className="w-3 h-3" />
            
          </span>
          <span>• {wins} Vitórias</span>
        </div>
      </div>
    </div>

     

    )
}

/**
 * Leaderboard Card
 * * Fetches and displays the top commanders in the naval fleet.
 */
export const Leaderboard: React.FC = () => {
  const { data: players, isLoading, isError } = useLeaderboard();

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">🏆</span>
            Ranking Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 border-2 border-dashed border-naval-error/30 rounded-lg">
            <p className="text-naval-error font-medium">Erro no radar de frotas</p>
            <p className="text-xs text-naval-text-muted mt-1 uppercase">Sinal interrompido</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50 rounded-2xl backdrop-blur-sm h-full flex flex-col min-w-2xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-amber-400">
            <Trophy className="w-5 h-5" />
            Leaderboard
          </CardTitle>
        </div>
        <p className="text-xs text-slate-400">Comandantes com maior pontuação na frota.</p>
      </CardHeader>

      <CardContent className="flex p-0">
        {isLoading ? (
          <LeaderboardSkeleton />
        ) : !players || players.length === 0 ? (
          <div className="text-center py-8 text-naval-text-muted italic text-xs">
            Nenhuma atividade de combate registrada.
          </div>
        ) : (


          <div className="w-full p-2">
            <div className="space-y-3">
              {players.slice(0, 10).map((player, index) => (
                <PlayerRow
                  key={player.userId}
                  rankNumber={index + 1}
                  username={player.username}
                  points={player.points}
                  wins={player.wins}
                  isTopThree={index < 3}
                />
              ))}
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
