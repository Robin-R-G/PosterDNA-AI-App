/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sparkles, ArrowRight, ShieldCheck, Zap, Layers, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { loginWithGoogle } from '../firebase';

const slides = [
  {
    title: "Decode Design DNA",
    description: "Our AI analyzes your reference images to extract color palettes, layout hierarchies, and stylistic tokens.",
    icon: Zap,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBObJsVTob0_h9DEsWtz3TgVF7A9JZ7JbrzEC8RJraxhNpaGiSa2PDQOVnReV1U_Gf9wNmSJOjePoMsycf5AwG8T04n4kzuPGCGGRiW6Id_z6-d7keUorukM7BfjJ3SOwj6EiT4cWw9C4sNaJABScYz7SUv7E179SfPVxxqfaq-e-yzDkzSyAenO9VaKWssupde9HwUlnKdMO8DidFAWnRMVcuoiDAbep3iEtWvf7VZNKyTPLNdIiPg1xLKaIGarmimK9irpxSYmb-e"
  },
  {
    title: "Brand Memory Sync",
    description: "Store your unique design patterns in a secure stylistic vault to ensure consistency across all your campaigns.",
    icon: ShieldCheck,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCc_uRDT08RwLAh1gcy5oD2qVvAVJ0uObiP1-alSYXlwm9ZebBopXqrKO09A3uhF2lZ64n3JnqXQJHS-0dCyW-DKf7bLkVuBCQw0lvXgnrxmzmDX8U0teaYHkaYZ08nnN92lNcVKSTl8yMIf6wC8CWlp-huBO2F3FqPHPgrfl-ZRZev7wg401JbLnB2TyVHCYvi0BXdDoGe2DKA9TA6BVvY-HnKGHFTLxvJPeY7A1ZgxxSaulA7XjlKd3apXcUSu4IU1GXvDFfjmYNx"
  },
  {
    title: "Generate Masterpieces",
    description: "Transform your DNA tokens into high-fidelity posters using our advanced generative layers.",
    icon: Layers,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhuvXN81ZvdYu1UQh28u23JSZA2jvgfH814WrzLMc8RZn7WI8kE-aaLKBaaqAMJmEu-6zjN4oNiXGAGXPCkHsa1ZYpOqFD3Of9-IJSsfsiA_pGbQiLW_PXLCPVvsvYD4oKfWXgWR1AvcE9jMt9NqwowY6k8fcCSXGX3TNNg7_3C6cRHDib8mo_4AREkTyUv6f1PeuFaUmI6lCuwaAY_9Mdh79t2ktzPpNetdFrf7Rf7rWSwnC29Bs_x9eLczyXRoz0Is4UQ9xzh_QQ"
  }
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-background z-[100] flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-24 h-24 rounded-3xl dna-border flex items-center justify-center shadow-[0_0_50px_rgba(228,181,255,0.3)]">
            <Sparkles className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-black tracking-[0.3em] uppercase dna-gradient-text">
            PosterDNA AI
          </h1>
        </motion.div>
      </div>
    );
  }

  const SlideIcon = slides[currentSlide].icon;

  return (
    <div className="fixed inset-0 bg-background z-[90] overflow-hidden flex flex-col">
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="absolute inset-0 p-8 flex flex-col md:flex-row items-center justify-center gap-12"
          >
            <div className="w-full md:w-1/2 max-w-md space-y-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <SlideIcon className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-lg text-on-surface-variant leading-relaxed font-medium">
                  {slides[currentSlide].description}
                </p>
              </div>
              <div className="flex gap-2">
                {slides.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-zinc-800'}`} 
                  />
                ))}
              </div>
            </div>

            <div className="w-full md:w-1/2 max-w-lg aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl gold-glow border border-white/10">
              <img 
                src={slides[currentSlide].image} 
                alt={slides[currentSlide].title}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-8 md:p-12 bg-zinc-950/50 backdrop-blur-xl border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="text-zinc-500 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors"
          >
            Next Side
          </button>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={loginWithGoogle}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 px-10 py-5 bg-tertiary text-zinc-950 font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-yellow-950/20 hover:scale-105 active:scale-95 transition-all"
          >
            <LogIn className="w-5 h-5" />
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
