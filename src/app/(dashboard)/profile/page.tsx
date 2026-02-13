/**
 * Profile Page - Career Stats & Medals
 * 
 * Displays comprehensive user statistics, achievements, and earned medals.
 * Features detailed stats visualization and an interactive medal showcase.
 */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUserProfile, getUserRank, getWinRate } from '@/hooks/queries/useUserProfile';
import { MedalBadge } from '@/components/profile/MedalBadge';
import { getUserMedals, getUnlockedMedalCount, sortMedalsByStatus } from '@/lib/medals';
import { Trophy, Skull, Swords, Target, Ship, Medal, ArrowRight, Zap } from 'lucide-react';

/**
 * Stat Card Component
 */
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: 'success' | 'danger' | 'info';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, color = 'info' }) => {
  const bgClasses = {
    success: 'bg-emerald-950/40 border-emerald-800/40',
    danger: 'bg-rose-950/40 border-rose-800/40',
    info: 'bg-slate-800/40 border-slate-700/40',
  };

  const iconBgClasses = {
    success: 'bg-emerald-500/20 text-emerald-400',
    danger: 'bg-rose-500/20 text-rose-400',
    info: 'bg-cyan-500/20 text-cyan-400',
  };

  return (
    <div className={`relative p-5 rounded-2xl border ${bgClasses[color]} backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBgClasses[color]}`}>
          {icon}
        </div>
        <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
          {label}
        </p>
      </div>
      <p className="text-4xl font-bold text-white mb-1">
        {value}
      </p>
      {trend && (
        <p className="text-sm text-slate-400">
          {trend}
        </p>
      )}
    </div>
  );
};

/**
 * Profile Page Component
 */
export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading, isError } = useUserProfile();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-naval-border rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-naval-border rounded" />
            ))}
          </div>
          <div className="h-96 bg-naval-border rounded" />
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-2">
              Erro ao Carregar Perfil
            </h2>
            <p className="text-naval-text-secondary mb-4">
              Não foi possível carregar suas informações
            </p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  const gamesPlayed = user.wins + user.losses;
  const rank = getUserRank(user.wins);
  const winRate = getWinRate(user.wins, gamesPlayed);
  const medals = getUserMedals(user);
  const sortedMedals = sortMedalsByStatus(medals);
  const unlockedCount = getUnlockedMedalCount(medals);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/lobby')}
          className="mb-4 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 -ml-2"
        >
          ← Voltar ao Lobby
        </Button>
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Perfil do Comandante
          </h1>
          <p className="text-cyan-400/70 mt-2 text-lg">
            Sua carreira e conquistas
          </p>
        </div>
      </div>

      {/* Player Identity Card */}
      <Card className="mb-6 bg-slate-900/50 border-slate-800 rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {/* Avatar and Info */}
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-4xl border-[3px] border-cyan-400 shadow-lg shadow-cyan-500/20">
                ⚓
              </div>

              {/* Info */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {user.username}
                </h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30">
                  <span className="text-sm">{rank.icon}</span>
                  <span className="text-sm font-semibold text-cyan-400">
                    {rank.title}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-6 px-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{unlockedCount}</p>
                <p className="text-xs text-slate-400 mt-1">Medalhas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-cyan-400">{winRate}</p>
                <p className="text-xs text-slate-400 mt-1">Taxa de Vitória</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Vitórias"
          value={user.wins}
          icon={<Trophy className="w-5 h-5" />}
          color="success"
          trend={`Em ${gamesPlayed} partidas`}
        />
        <StatCard
          label="Derrotas"
          value={user.losses}
          icon={<Skull className="w-5 h-5" />}
          color="danger"
          trend={`Em ${gamesPlayed} partidas`}
        />
        <StatCard
          label="Total de Partidas"
          value={gamesPlayed}
          icon={<Swords className="w-5 h-5" />}
          color="info"
          trend="Desde o início"
        />
      </div>

      {/* Detailed Stats */}
      <Card className="mb-6 bg-slate-900/50 border-slate-800 rounded-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cyan-500/15 flex items-center justify-center">
              <Target className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-white">
                Estatísticas Detalhadas
              </CardTitle>
              <CardDescription className="text-cyan-400/60 text-sm">
                Análise completa do desempenho
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Win Rate Bar */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-cyan-400">
                  Taxa de Vitória
                </span>
                <span className="text-lg font-bold text-cyan-400">
                  {winRate}
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000 rounded-full"
                  style={{ width: winRate }}
                />
              </div>
            </div>

            {/* Additional Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/50">
                <p className="text-xs text-cyan-400/60 mb-2">Vitórias Consecutivas</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/50">
                <p className="text-xs text-cyan-400/60 mb-2">Melhor Sequência</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/50">
                <p className="text-xs text-cyan-400/60 mb-2">Total de Acertos</p>
                <p className="text-2xl font-bold text-white">-</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/50">
                <p className="text-xs text-cyan-400/60 mb-2">Total de Tiros</p>
                <p className="text-2xl font-bold text-white">-</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-cyan-400/60 text-sm">
              <Zap className="w-4 h-4" />
              <p>Estatísticas avançadas serão registradas em partidas futuras</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medals Showcase */}
      <Card className="bg-slate-900/50 border-slate-800 rounded-2xl overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center">
                  <Medal className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <span className="block text-lg font-bold">Medalhas e Conquistas</span>
                  <span className="block text-sm font-normal text-cyan-400/60">
                    {unlockedCount} de {medals.length} medalhas desbloqueadas
                  </span>
                </div>
              </CardTitle>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-cyan-400">
                {Math.round((unlockedCount / medals.length) * 100)}%
              </p>
              <p className="text-xs text-cyan-400/70">Concluído</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {medals.length > 0 ? (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-cyan-400/70">
                    Progresso de Conquistas
                  </span>
                  <span className="text-sm font-semibold text-cyan-400">
                    {unlockedCount} / {medals.length}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000 rounded-full"
                    style={{ width: `${(unlockedCount / medals.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Medal Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 justify-items-center">
                {sortedMedals.map((medal) => (
                  <MedalBadge key={medal.id} medal={medal} size="md" />
                ))}
              </div>

              {/* Empty State Hint */}
              {unlockedCount === 0 && (
                <div className="text-center py-12 border-t border-slate-800 mt-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <Ship className="w-8 h-8 text-cyan-400" />
                    </div>
                  </div>
                  <p className="text-slate-300 mb-6">
                    Jogue suas primeiras partidas para começar a desbloquear medalhas!
                  </p>
                  <Button
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                    onClick={() => router.push('/lobby')}
                  >
                    Ir para o Lobby
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Nenhuma medalha disponível
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
