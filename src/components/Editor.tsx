/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Layers, Sliders, Palette, Share2, Download, Zap, RotateCcw, Layout, Maximize2, Type, ImageIcon, Cloud, ChevronRight, Target, Send, Undo2, Redo2, ChevronDown, LayoutDashboard, User, CheckCircle2, Lightbulb, BrainCircuit, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Layer, BrandIdentity } from '../types';
import Canvas from './Canvas';
import DesignCopilot from './DesignCopilot';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthProvider';

export default function Editor({ initialLayers }: { initialLayers?: Layer[] | null }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'layers' | 'style' | 'ai'>('layers');
  const [brands, setBrands] = useState<BrandIdentity[]>([]);
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [activeBrand, setActiveBrand] = useState<BrandIdentity | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'identities'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (s) => {
      setBrands(s.docs.map(d => ({ id: d.id, ...d.data() }) as BrandIdentity));
    });
    return () => unsubscribe();
  }, [user]);

  const applyBrand = (brand: BrandIdentity) => {
    setActiveBrand(brand);
    setShowBrandPicker(false);
    // Logic to apply color palette, fonts etc would go here
  };

  const [layers, setLayers] = useState<Layer[]>(initialLayers || [
    { id: '1', type: 'background', content: '', style: { width: '100%', height: '100%', backgroundColor: '#09090b', zIndex: 0 }, isHidden: false, isLocked: false },
    { id: '2', type: 'text', content: 'GRAND EVENT 2026', style: { top: '15%', left: '10%', fontSize: '48px', color: '#ffffff', zIndex: 10, fontFamily: 'Inter' }, isHidden: false, isLocked: false },
    { id: '3', type: 'portrait', content: '', style: { top: '35%', left: '15%', width: '200px', height: '280px', borderRadius: '24px', zIndex: 5, backgroundColor: '#18181b' }, isHidden: false, isLocked: false },
    { id: '4', type: 'logo', content: '', style: { bottom: '8%', right: '10%', width: '80px', height: '80px', zIndex: 10, backgroundColor: '#eab308', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }, isHidden: false, isLocked: false },
  ]);

  useEffect(() => {
    if (initialLayers) {
      setLayers(initialLayers);
    }
  }, [initialLayers]);

  const tabs = [
    { id: 'layers', icon: Layers, label: 'Structure' },
    { id: 'style', icon: Palette, label: 'Branding' },
    { id: 'ai', icon: Zap, label: 'AI Engines' }
  ];

  return (
    <div className="h-[calc(100vh-160px)] flex gap-8">
      {/* Sidebar Toolset */}
      <aside className="w-80 flex flex-col gap-6 sticky top-0">
        <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 glass-surface p-6 rounded-[2.5rem] border border-white/5 overflow-y-auto custom-scrollbar space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'layers' && (
              <motion.div
                key="layers"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-containers"
              >
                <SidebarSection icon={Target} title="Ratio Reflow">
                  <div className="grid grid-cols-2 gap-2">
                    <RatioButton label="Instagram" active />
                    <RatioButton label="A4 Print" />
                    <RatioButton label="X Banner" />
                    <RatioButton label="Poster" />
                  </div>
                </SidebarSection>

                <SidebarSection icon={Layout} title="Layer Layouts">
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="aspect-square rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer overflow-hidden flex items-center justify-center">
                        <LayoutDashboard className="w-4 h-4 text-zinc-700" />
                      </div>
                    ))}
                  </div>
                </SidebarSection>
              </motion.div>
            )}

            {activeTab === 'style' && (
              <motion.div
                key="style"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">DNA Palette</h3>
                    <div className="flex h-12 rounded-xl overflow-hidden border border-white/10">
                        {['#e9c400', '#a855f7', '#000000', '#ffffff'].map(c => (
                            <div key={c} className="flex-1" style={{ backgroundColor: c }} />
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Typography Analysis</h3>
                    <div className="space-y-2">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-sm font-bold text-white">Space Grotesk • Display</div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-sm font-bold text-white">Inter • Body</div>
                    </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <AIActionCard 
                  title="Vision Intelligence" 
                  desc="Segment faces from background with edge refinement"
                  icon={Sparkles}
                />
                <AIActionCard 
                  title="Reference Fusion" 
                  desc="Merge stylistic tokens from two distinct sources"
                  icon={RotateCcw}
                />
                <AIActionCard 
                  title="Design Copilot" 
                  desc="Optimize spacing, contrast, and visual rhythm"
                  icon={Cloud}
                />
                
                <DesignCopilot 
                  layers={layers} 
                  activeBrand={activeBrand} 
                  onApplyOptimization={setLayers}
                />
                
                <div className="pt-6 border-t border-white/5 space-y-4">
                    <button 
                        onClick={() => setShowBrandPicker(true)}
                        className="w-full py-4 bg-tertiary/10 text-tertiary font-black uppercase tracking-widest text-[10px] rounded-2xl border border-tertiary/20 hover:bg-tertiary hover:text-zinc-950 transition-all flex items-center justify-center gap-3"
                    >
                        <BrainCircuit className="w-4 h-4" />
                        Apply Brand Memory
                    </button>
                    
                    {activeBrand && (
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg overflow-hidden">
                                    <img src={activeBrand.imageUrl} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-[10px] font-black text-white uppercase">{activeBrand.name} ACTIVE</span>
                            </div>
                            <button onClick={() => setActiveBrand(null)} className="text-zinc-500 hover:text-secondary">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Brand Picker Modal */}
        <AnimatePresence>
            {showBrandPicker && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={() => setShowBrandPicker(false)}
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative w-full max-w-lg glass-surface rounded-[2.5rem] border border-white/10 p-8 space-y-8 shadow-[0_30px_100px_rgba(0,0,0,0.5)]"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Select DNA Source</h3>
                            <button onClick={() => setShowBrandPicker(false)}><X className="text-zinc-500" /></button>
                        </div>
                        
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {brands.map(brand => (
                                <div 
                                    key={brand.id}
                                    onClick={() => applyBrand(brand)}
                                    className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-tertiary/40 cursor-pointer transition-all flex items-center gap-4 group"
                                >
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800">
                                        <img src={brand.imageUrl} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-white uppercase">{brand.name}</p>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{brand.dna?.typography.primary} DNA</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-tertiary transition-colors" />
                                </div>
                            ))}
                            {brands.length === 0 && (
                                <p className="text-center py-8 text-zinc-500 font-medium">No brand memories found. Create one in the Brand Memory tab.</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        <button className="w-full py-5 bg-tertiary text-zinc-950 font-black uppercase tracking-[0.2em] text-xs rounded-3xl shadow-xl shadow-yellow-900/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
          <Download className="w-5 h-5" /> Export DNS Assets
        </button>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col gap-6 relative">
        <header className="flex items-center justify-between glass-surface px-8 py-4 rounded-3xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-tight">Project: Neo-Minimalist</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">DNA: Luminal Studio • Malayalam v2</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-3 bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-secondary text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:scale-105 active:scale-95 transition-all">
              Live Preview <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        <Canvas layers={layers} onUpdateLayers={setLayers} />

        {/* AI Command Bar (Bottom) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-20">
          <div className="glass-surface border border-white/10 rounded-3xl p-2 pl-6 flex items-center gap-4 shadow-[0_20px_100px_rgba(0,0,0,0.8)]">
            <div className="text-primary"><Zap className="w-5 h-5 fill-current animate-pulse" /></div>
            <input 
              type="text"
              placeholder="Instruct AI: 'Make the title glow' or 'Improve Malayalam kerning'..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-zinc-600 font-medium text-sm"
            />
            <button className="bg-primary text-white p-4 rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarSection({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4 mb-8">
      <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 text-outline">
        <Icon className="w-4 h-4" /> {title}
      </h3>
      {children}
    </div>
  );
}

function RatioButton({ label, active }: { label: string, active?: boolean }) {
  return (
    <button className={`py-4 px-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
      active 
        ? 'bg-primary/20 border-primary text-primary' 
        : 'bg-white/5 border-white/5 text-zinc-400 hover:border-white/20 hover:text-white'
    }`}>
      {label}
    </button>
  );
}

function AIActionCard({ title, desc, icon: Icon }: { title: string, desc: string, icon: any }) {
  return (
    <div className="p-5 rounded-[2rem] bg-zinc-900/50 border border-white/5 space-y-2 group cursor-pointer hover:border-primary/30 transition-all">
      <div className="flex items-center gap-3 text-zinc-400 group-hover:text-primary transition-colors">
        <Icon className="w-5 h-5" />
        <span className="text-[10px] font-black uppercase tracking-widest">{title}</span>
      </div>
      <p className="text-[10px] text-zinc-600 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}
