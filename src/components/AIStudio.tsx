/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ChevronRight, ChevronLeft, Target, Palette, 
  Type, ImageIcon, User, Calendar, BrainCircuit, 
  Maximize2, Zap, Layout, CheckCircle2, Loader2, Upload, X
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { BrandIdentity, Layer } from '../types';
import { geminiService } from '../services/geminiService';
import { analytics } from '../services/analyticsService';

const CATEGORIES = ["Church Opening", "Revival Meeting", "Youth Conference", "Healing Meeting", "Sunday Service"];
const RATIOS = ["4:5 (Standard)", "9:16 (Story)", "1:1 (Square)", "16:9 (Landscape)"];

export default function AIStudio({ onComplete }: { onComplete: (layers: Layer[]) => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [brands, setBrands] = useState<BrandIdentity[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Wizard State
  const [formData, setFormData] = useState({
    category: '',
    style: '',
    palette: [] as string[],
    typography: '',
    portraits: [] as { data: string, mimeType: string }[],
    heroIndex: 0,
    eventDetails: '',
    brandId: '',
    ratio: '4:5'
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'identities'), where('userId', '==', user.uid));
    return onSnapshot(q, (s) => {
      setBrands(s.docs.map(d => ({ id: d.id, ...d.data() }) as BrandIdentity));
    });
  }, [user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          portraits: [...prev.portraits, { data: reader.result as string, mimeType: file.type }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const next = () => setStep(s => Math.min(10, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  const generate = async () => {
    setIsGenerating(true);
    analytics.action('ai_studio_generation_started', 'ai_studio');
    try {
      const layers = await geminiService.generatePosterFromStudio(formData);
      onComplete(layers);
      analytics.aiEvent('poster_generation', true);
    } catch (err) {
      console.error(err);
      alert("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-4xl space-y-12">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden flex gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 h-full transition-all duration-500 ${i + 1 <= step ? 'bg-tertiary shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-transparent'}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-surface p-12 rounded-[3.5rem] border border-white/10 shadow-2xl space-y-10"
          >
            {/* Step Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-tertiary">Step {step} of 10</span>
                 <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
                    {step === 1 && "Select Category"}
                    {step === 2 && "Visual Style"}
                    {step === 3 && "Color Palette"}
                    {step === 4 && "Typography"}
                    {step === 5 && "Upload Portraits"}
                    {step === 6 && "The Hero Speaker"}
                    {step === 7 && "Event Parameters"}
                    {step === 8 && "DNA Inheritance"}
                    {step === 9 && "Canvas Ratio"}
                    {step === 10 && "Final Synthesis"}
                 </h2>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                 <Zap className="w-6 h-6 text-zinc-500" />
              </div>
            </div>

            <div className="min-h-[300px]">
                {step === 1 && (
                    <div className="grid grid-cols-2 gap-4">
                        {CATEGORIES.map(cat => (
                            <SelectionCard 
                                key={cat}
                                label={cat}
                                active={formData.category === cat}
                                onClick={() => setFormData({...formData, category: cat})}
                            />
                        ))}
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <p className="text-zinc-500 font-medium">Describe the visual tone or choose an AI suggestion.</p>
                        <div className="grid grid-cols-2 gap-4">
                            {["Ethereal Glow", "Cyberpunk Brutalist", "Modern Minimal", "High-Contrast Divine"].map(s => (
                                <SelectionCard key={s} label={s} active={formData.style === s} onClick={() => setFormData({...formData, style: s})} />
                            ))}
                        </div>
                        <input 
                            className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-white outline-none focus:border-tertiary"
                            placeholder="Custom style description..."
                            value={formData.style}
                            onChange={(e) => setFormData({...formData, style: e.target.value})}
                        />
                    </div>
                )}

                {step === 3 && (
                    <div className="grid grid-cols-2 gap-6">
                        {[
                          ['#a855f7', '#6b21a8', '#000000'],
                          ['#f59e0b', '#78350f', '#000000'],
                          ['#3b82f6', '#1e3a8a', '#ffffff'],
                          ['#ef4444', '#7f1d1d', '#000000']
                        ].map((colors, i) => (
                            <div 
                                key={i}
                                onClick={() => setFormData({...formData, palette: colors})}
                                className={`p-6 rounded-3xl border cursor-pointer transition-all ${JSON.stringify(formData.palette) === JSON.stringify(colors) ? 'border-tertiary bg-tertiary/5' : 'border-white/5 bg-white/5'}`}
                            >
                                <div className="flex gap-2">
                                    {colors.map(c => <div key={c} className="w-8 h-8 rounded-full border border-white/20" style={{backgroundColor: c}} />)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {step === 4 && (
                    <div className="grid grid-cols-2 gap-4">
                         {["Futurist Sans", "Modern Serif", "Malayalam Calligraphy", "Stencil Industrial"].map(f => (
                             <SelectionCard key={f} label={f} active={formData.typography === f} onClick={() => setFormData({...formData, typography: f})} />
                         ))}
                    </div>
                )}

                {step === 5 && (
                    <div className="space-y-8 text-center">
                         <div className="grid grid-cols-4 gap-4">
                            {formData.portraits.map((p, i) => (
                                <div key={i} className="aspect-square rounded-2xl overflow-hidden relative border border-white/10">
                                    <img src={p.data} className="w-full h-full object-cover" />
                                </div>
                            ))}
                             <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-tertiary/40 transition-all flex flex-col items-center justify-center cursor-pointer gap-2">
                                <Upload className="w-6 h-6 text-zinc-600" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Upload</span>
                                <input type="file" multiple onChange={handleFileUpload} hidden />
                            </label>
                         </div>
                    </div>
                )}

                {step === 6 && (
                    <div className="grid grid-cols-3 gap-6">
                         {formData.portraits.map((p, i) => (
                             <div 
                                key={i}
                                onClick={() => setFormData({...formData, heroIndex: i})}
                                className={`relative rounded-[2rem] overflow-hidden border-4 transition-all cursor-pointer ${formData.heroIndex === i ? 'border-tertiary scale-105 shadow-2xl shadow-yellow-900/40' : 'border-transparent opacity-40'}`}
                             >
                                <img src={p.data} className="w-full aspect-[3/4] object-cover" />
                                {formData.heroIndex === i && (
                                    <div className="absolute top-4 right-4 bg-tertiary text-zinc-950 p-2 rounded-lg">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                )}
                             </div>
                         ))}
                    </div>
                )}

                {step === 7 && (
                    <textarea 
                        className="w-full h-48 bg-white/5 border border-white/10 p-8 rounded-3xl text-xl font-bold text-white outline-none focus:border-tertiary custom-scrollbar"
                        placeholder="Paste event text, dates, address, and phone numbers here. AI will extract and format them."
                        value={formData.eventDetails}
                        onChange={(e) => setFormData({...formData, eventDetails: e.target.value})}
                    />
                )}

                {step === 8 && (
                    <div className="grid grid-cols-2 gap-4">
                        <SelectionCard 
                            label="None (Universal Style)"
                            active={!formData.brandId}
                            onClick={() => setFormData({...formData, brandId: ''})}
                        />
                        {brands.map(b => (
                            <div 
                                key={b.id}
                                onClick={() => setFormData({...formData, brandId: b.id!})}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${formData.brandId === b.id ? 'border-tertiary bg-tertiary/5' : 'border-white/5 bg-white/5 opacity-50'}`}
                            >
                                <img src={b.imageUrl} className="w-10 h-10 rounded-lg object-cover" />
                                <span className="text-xs font-black text-white uppercase">{b.name}</span>
                            </div>
                        ))}
                    </div>
                )}

                {step === 9 && (
                    <div className="grid grid-cols-2 gap-4">
                        {RATIOS.map(r => (
                            <SelectionCard 
                                key={r}
                                label={r}
                                active={formData.ratio === r.split(' ')[0]}
                                onClick={() => setFormData({...formData, ratio: r.split(' ')[0]})}
                            />
                        ))}
                    </div>
                )}

                {step === 10 && (
                    <div className="flex flex-col items-center justify-center text-center space-y-12">
                         <div className="relative">
                            {isGenerating ? (
                                <div className="w-32 h-32 rounded-full border-4 border-t-tertiary border-zinc-800 animate-spin" />
                            ) : (
                                <div className="w-32 h-32 rounded-[2.5rem] bg-tertiary flex items-center justify-center shadow-2xl shadow-yellow-900/40 rotate-12">
                                    <Sparkles className="w-12 h-12 text-zinc-950 -rotate-12" />
                                </div>
                            )}
                         </div>
                         <div className="space-y-4">
                            <h3 className="text-4xl font-black text-white uppercase tracking-tight">Ready for Genesis</h3>
                            <p className="text-zinc-500 font-medium max-w-sm">
                                All parameters synced. Our AI Neural engine is ready to synthesize your masterpiece.
                            </p>
                         </div>
                         <button 
                            disabled={isGenerating}
                            onClick={generate}
                            className="px-16 py-8 bg-tertiary text-zinc-950 font-black uppercase tracking-widest rounded-3xl shadow-2xl shadow-yellow-900/20 active:scale-95 transition-all flex items-center gap-4 text-lg"
                         >
                            {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-current" />}
                            Initialize Poster Extraction
                         </button>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between border-t border-white/5 pt-10">
                <button 
                    onClick={back}
                    disabled={step === 1 || isGenerating}
                    className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors disabled:opacity-0"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Rollback</span>
                </button>
                {step < 10 && (
                    <button 
                        onClick={next}
                        className="px-10 py-5 bg-white/5 border border-white/10 hover:border-tertiary/40 group rounded-2xl flex items-center gap-4 transition-all"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-tertiary">Advance Proceed</span>
                        <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-tertiary" />
                    </button>
                )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function SelectionCard({ label, active, onClick }: any) {
    return (
        <div 
            onClick={onClick}
            className={`p-8 rounded-3xl border transition-all cursor-pointer flex items-center justify-between group ${active ? 'border-tertiary bg-tertiary/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
        >
            <span className={`text-sm font-black uppercase tracking-widest ${active ? 'text-tertiary' : 'text-zinc-500 group-hover:text-white'}`}>{label}</span>
            <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${active ? 'bg-tertiary border-tertiary' : 'border-white/10 bg-black/20'}`}>
                {active && <CheckCircle2 className="w-4 h-4 text-zinc-950" />}
            </div>
        </div>
    );
}

