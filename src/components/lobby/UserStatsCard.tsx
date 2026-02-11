/**
 * User Stats Card Component
 * 
 * Displays user profile statistics including rank, wins, losses, and win rate.
 * Includes skeleton loading state for smooth UX.
 */
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useUserProfile, getUserRank, getWinRate } from '@/hooks/queries/useUserProfile';
import Image from 'next/image';
import { Trophy, Swords, Target, Crosshair, Medal } from 'lucide-react';
/**
 * Skeleton loader for stats
 */
const StatSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-6 bg-naval-border rounded w-3/4" />
    <div className="h-4 bg-naval-border rounded w-1/2" />
  </div>
);

/**
 * Individual stat display
 */
interface StatItemProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  highlight?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, icon, highlight }) => (
   <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/30 flex flex-col items-center justify-center hover:bg-slate-800/50 transition-colors">
    <span className="w-5 h-5 text-amber-400 mb-1">{icon}</span>
    <div className="text-2xl font-bold text-white">
      <p className='items-center justify-center text-center'>{label}</p>
    </div>
    <div className={`text-lg font-bold  ${highlight ? 'text-naval-action' : 'text-white'}`}>
      <p className='items-center justify-center text-center'>{value}</p>
      </div>
  </div>
);

/**
 * User Stats Card
 * 
 * Fetches and displays the current user's game statistics.
 */
export const UserStatsCard: React.FC = () => {
  const { data: user, isLoading, isError } = useUserProfile();

  if (isError) {
    return (
      <Card className='rounded-md border border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl overflow-hidden h-half' >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl"></span>
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-naval-error">Erro ao carregar estatísticas</p>
            <p className="text-sm text-naval-text-muted mt-1">
              Tente recarregar a página
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-naval-border rounded-md" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 bg-naval-border rounded-md" />
              <div className="h-20 bg-naval-border rounded-md" />
              <div className="h-20 bg-naval-border rounded-md" />
              <div className="h-20 bg-naval-border rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const rank = getUserRank(user.wins);
  const gamesPlayed = user.wins + user.losses;
  const winRate = getWinRate(user.wins, gamesPlayed);

  return (
    <Card className='border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl overflow-hidden h-half'>
     <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Trophy className="w-32 h-32 text-cyan-500" />
      </div>
     <CardHeader className="py-8   ">
        <CardTitle className="flex items-center gap-2 text-cyan-400">
          <Medal className="w-5 h-5" />  Estatísticas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        {/* User Info & Rank */}
       <div className="flex items-center gap-4 bg-slate-800/50 p-0 rounded-xl border border-slate-700/50">
          <div className="relative">
            <div className="h-20 w-20 border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Image src="/mortyy.jpg" alt="@dimas" width={150} height={150} className="border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]"></Image>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-900">
              {rank.icon}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{user.username}</h3>
            <div className="flex items-center gap-1 text-amber-400 text-sm font-medium">
              <span>{rank.title}</span>
              {/*<span className="text-xs">{rank.icon}</span> */ }
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatItem
            label= "Vitórias"
            value={user.wins}
            icon={<Trophy className="w-6 h-6 text-amber-400 mb-1" />}
            highlight 
          />
          <StatItem
            label="Derrotas"
            value={user.losses}
            icon={<Swords className="w-6 h-6 text-red-400 mb-1" />}
          />
          <StatItem
            label="Partidas"
            value={gamesPlayed}
            icon={<Target className="w-6 h-6 text-cyan-400 mb-1" />}
          />
          <StatItem
            label="Taxa de Vitória"
            value={winRate}
            icon={<Crosshair className="w-6 h-6 text-green-400 mb-1" />}
            highlight
          />
        </div>

        {/* Progress to next rank */}
        <div className="p-3 rounded-md bg-naval-bg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-naval-text-muted">Progresso para próximo rank</span>
            <span className="text-xs text-naval-text-secondary">{user.wins}/10 vitórias</span>
          </div>
          <div className="h-2 bg-naval-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-naval-action to-naval-action-hover transition-all duration-500"
              style={{ width: `${Math.min((user.wins / 10) * 100, 100)}%` }} // TODO: Aqui nao ta funcionando ainda, dar um jeito de pegar um, nextrank
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStatsCard;
