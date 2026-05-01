/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode, useEffect } from 'react';
import { Menu, Home, FolderHeart, Sparkles, Fingerprint, UserCircle, LogIn, LogOut, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Page } from '../types';
import { useAuth } from './AuthProvider';
import { loginWithGoogle, logout } from '../firebase';
import { analytics } from '../services/analyticsService';
import Onboarding from './Onboarding';

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export default function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const { user, isPro } = useAuth();
  
  useEffect(() => {
    analytics.pageView(currentPage);
  }, [currentPage]);

  const navItems: { id: Page; label: string; icon: any }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'projects', label: 'Projects', icon: FolderHeart },
    { id: 'fusion', label: 'Fusion', icon: Fingerprint },
    { id: 'ai-studio', label: 'AI Studio', icon: Sparkles },
    { id: 'memory', label: 'Memory', icon: BrainCircuit },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30">
      {/* TopAppBar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-zinc-950/70 backdrop-blur-2xl border-b border-white/10 shadow-xl shadow-purple-950/20 px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center">
        {/* Left Spacer */}
        <div className="flex items-center">
          {/* This preserves center alignment by balancing the right side */}
        </div>

        {/* Center: Logo & Brand */}
        <div className="flex items-center gap-3 whitespace-nowrap justify-self-center">
          <div className="h-10 w-10 flex items-center justify-center bg-zinc-900 border border-white/10 rounded-xl flex-shrink-0 shadow-inner">
             <BrainCircuit className="text-tertiary w-6 h-6 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
          </div>
          <h1 className="text-xl font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-tertiary via-white to-tertiary-fixed leading-none">
            PosterDNA AI
          </h1>
        </div>

        {/* Right: User Actions */}
        <div className="flex items-center gap-3 justify-end">
          {user ? (
            <>
              <div className="flex flex-col items-end hidden md:flex">
                <span className="text-[12px] font-semibold tracking-wider text-on-surface">{user.displayName || 'Creator'}</span>
                <span className={`${isPro ? 'text-tertiary' : 'text-zinc-500'} text-[10px] uppercase tracking-tighter`}>
                  {isPro ? 'Pro Member' : 'Free Plan'}
                </span>
              </div>
              <div className="group relative">
                <div className="h-10 w-10 rounded-full border border-tertiary/30 p-0.5 overflow-hidden ring-2 ring-tertiary/10 cursor-pointer hover:ring-tertiary/40 transition-all duration-300">
                  <img
                    alt="User Profile"
                    className="h-full w-full object-cover rounded-full"
                    src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                  />
                </div>
                <div className="absolute right-0 top-full pt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50">
                  <button 
                    onClick={logout}
                    className="bg-zinc-900 border border-white/10 p-3 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all w-36 shadow-2xl"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button 
              onClick={loginWithGoogle}
              className="flex items-center gap-2 px-4 py-2 bg-tertiary text-zinc-950 font-bold uppercase tracking-widest text-xs rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 pt-24 pb-32">
        <AnimatePresence mode="wait">
          {user ? (
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              {children}
            </motion.div>
          ) : (
            <Onboarding />
          )}
        </AnimatePresence>
      </main>

      {/* BottomNavBar */}
      {user && (
        <nav className="fixed bottom-0 left-0 w-full h-20 bg-zinc-950/80 backdrop-blur-3xl border-t border-white/10 rounded-t-2xl shadow-[0_-10px_40px_rgba(106,27,154,0.2)] flex justify-around items-center px-4 pb-safe z-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex flex-col items-center justify-center transition-all duration-300 relative ${
                  isActive 
                    ? 'text-tertiary drop-shadow-[0_0_10px_rgba(233,196,0,0.4)] scale-110' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {item.id === 'ai-studio' ? (
                  <div className={`h-12 w-12 -mt-6 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center shadow-lg transition-transform ${isActive ? 'scale-110 border-tertiary/50' : ''}`}>
                    <Icon className={`w-6 h-6 ${isActive ? 'text-tertiary' : 'text-zinc-500'}`} />
                  </div>
                ) : (
                  <Icon className="w-6 h-6 mb-1" />
                )}
                <span className="font-sans font-medium text-[10px] uppercase tracking-wider">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute -bottom-2 w-1 h-1 bg-tertiary rounded-full shadow-[0_0_10px_#e9c400]"
                  />
                )}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
