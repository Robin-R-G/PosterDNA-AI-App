/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ShieldCheck, AlertCircle, Zap, 
  ArrowRight, CheckCircle2, Loader2, Gauge, 
  Layout, Type, Palette, Move, User, Eye, Terminal
} from 'lucide-react';
import { Layer, DesignCritique, BrandIdentity } from '../types';
import { geminiService } from '../services/geminiService';
import { analytics } from '../services/analyticsService';

interface DesignCopilotProps {
  layers: Layer[];
  activeBrand?: BrandIdentity | null;
  onApplyOptimization: (newLayers: Layer[]) => void;
}

export default function DesignCopilot({ layers, activeBrand, onApplyOptimization }: DesignCopilotProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [critique, setCritique] = useState<DesignCritique | null>(null);
  const [optimizingId, setOptimizingId] = useState<string | null>(null);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    analytics.action('design_critique_started', 'copilot');
    try {
      const result = await geminiService.critiqueDesign(layers, activeBrand);
      setCritique(result);
      analytics.aiEvent('design_critique', true);
    } catch (err) {
      console.error(err);
      alert("Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyOptimization = async (suggestionId: string) => {
    setOptimizingId(suggestionId);
    analytics.action('apply_optimization', 'copilot');
    try {
      const optimizedLayers = await geminiService.optimizeDesign(layers, suggestionId);
      onApplyOptimization(optimizedLayers);
      // Removed alert, feedback is visual via layer update
    } catch (err) {
      console.error(err);
      alert("Optimization failed.");
    } finally {
      setOptimizingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {!critique && !isAnalyzing && (
        <div className="p-8 bg-zinc-900/50 rounded-[2rem] border border-white/5 space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto border border-primary/20">
                <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Design Health Sync</h3>
                <p className="text-sm text-zinc-500 font-medium">AI will analyze structure, typography, and color harmony to score your work.</p>
            </div>
            <button 
                onClick={runAnalysis}
                className="w-full py-5 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-purple-900/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
                <Zap className="w-4 h-4 fill-current" /> Initialize Copilot
            </button>
        </div>
      )}

      {isAnalyzing && (
        <div className="p-12 flex flex-col items-center justify-center space-y-6 bg-zinc-900/20 rounded-[2rem] border border-white/5">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-xs font-black text-primary uppercase tracking-[0.3em] animate-pulse">Running Neural Critique...</p>
        </div>
      )}

      {critique && (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Score Card */}
            <div className="glass-surface p-8 rounded-[2.5rem] border border-white/10 flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Design Quotient</p>
                    <h4 className="text-5xl font-black text-white tracking-tighter">{critique.score}<span className="text-xl text-zinc-700">/100</span></h4>
                </div>
                <div className="relative h-16 w-16">
                   <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-zinc-800" />
                      <circle 
                        cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" 
                        strokeDasharray={175} 
                        strokeDashoffset={175 - (175 * critique.score) / 100} 
                        className="text-primary transition-all duration-1000"
                      />
                   </svg>
                   <Gauge className="absolute inset-0 m-auto w-6 h-6 text-primary/40" />
                </div>
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-2 gap-3">
                <CritiqueBite icon={Layout} label="Layout" value={critique.analysis.layout} />
                <CritiqueBite icon={Palette} label="Color" value={critique.analysis.colorHarmony} />
                <CritiqueBite icon={Type} label="Typography" value={critique.analysis.typography} />
                <CritiqueBite icon={Eye} label="Readability" value={critique.analysis.readability} />
            </div>

            {/* Suggestions */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Optimization Path</h5>
                    <button onClick={runAnalysis} className="text-[10px] font-black text-primary uppercase">Retrain Result</button>
                </div>
                
                {critique.suggestions.map((s) => (
                    <div 
                        key={s.id}
                        className="group bg-zinc-900/50 rounded-[1.5rem] border border-white/5 p-6 space-y-4 hover:border-primary/30 transition-all hover:bg-zinc-800/50"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                {s.impact === 'high' ? <Zap className="w-4 h-4 text-secondary fill-current" /> : <AlertCircle className="w-4 h-4 text-zinc-500" />}
                                <span className={`text-[9px] font-black uppercase tracking-widest ${s.impact === 'high' ? 'text-secondary' : 'text-zinc-500'}`}>{s.impact} Impact</span>
                            </div>
                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{s.category}</span>
                        </div>
                        <p className="text-sm font-medium text-zinc-300 leading-relaxed">{s.text}</p>
                        
                        <button 
                            disabled={!!optimizingId}
                            onClick={() => applyOptimization(s.id)}
                            className="w-full py-4 bg-white/5 text-white font-black uppercase tracking-widest text-[9px] rounded-xl border border-white/10 hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2 group-hover:bg-primary/20"
                        >
                            {optimizingId === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            One Tap Apply
                        </button>
                    </div>
                ))}
            </div>
        </motion.div>
      )}
    </div>
  );
}

function CritiqueBite({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center gap-2">
                <Icon className="w-3 h-3 text-zinc-600" />
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-[10px] font-bold text-white uppercase truncate">{value}</p>
        </div>
    );
}
