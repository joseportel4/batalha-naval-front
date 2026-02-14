// Layout do Dashboard - AuthGuard + Sidebar + UserMenu
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/utils';
import { useUserProfile } from '@/hooks/queries/useUserProfile';
import { useAuth } from '@/providers/AuthProvider';
import Image from 'next/image';
import { Anchor, User, LogOut, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const {logout} = useAuth();

  const { data: user } = useUserProfile();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur ">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
           <Link href="/lobby" className="flex items-center gap-2 text-xl font-bold text-slate-100 transition-colors hover:text-cyan-400">
            <Anchor className='h-8 w-8 text-cyan-400'></Anchor>
            <span>Batalha Naval</span>
          </Link>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="hidden md:flex flex-col items-end">
                    <div className="text-sm font-semibold text-slate-100">{user.username}</div>
                    <div className="text-xs text-slate-400">
                      {user.wins}V - {user.losses}D
                    </div>
                  </div>
                  <div className="relative h-10 w-10 rounded-full border border-slate-700 overflow-hidden hover:border-cyan-400 transition-colors">
                    <Image 
                      src="/mortyy.jpg" 
                      alt={user.username} 
                      width={40} 
                      height={40} 
                      className="object-cover"
                    />
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-slate-100">{user.username}</p>
                      <p className="text-xs text-slate-400">
                        {user.wins} vitórias · {user.losses} derrotas
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4 text-cyan-400" />
                    <span>Meu perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-400 hover:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
