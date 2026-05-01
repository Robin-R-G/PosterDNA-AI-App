/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Palette, Type, Layout, User, Zap, Sparkles, Loader2, Play } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { analytics } from '../services/analyticsService';

type FusionRole = 'colors' | 'typography' | 'layout' | 'portraits';

interface FusionSlot {
    role: FusionRole;
    data: string | null;
    mimeType: string | null;
}

export default function StyleFusion({ onFused }: { onFused: (dna: any) => void }) {
    const [slots, setSlots] = useState<FusionSlot[]>([
        { role: 'colors', data: null, mimeType: null },
        { role: 'typography', data: null, mimeType: null },
        { role: 'layout', data: null, mimeType: null },
        { role: 'portraits', data: null, mimeType: null }
    ]);
    const [isFusing, setIsFusing] = useState(false);

    const handleUpload = (role: FusionRole, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setSlots(prev => prev.map(s => s.role === role ? { ...s, data: reader.result as string, mimeType: file.type } : s));
        };
        reader.readAsDataURL(file);
    };

    const runFusion = async () => {
        const activeSlots = slots.filter(s => s.data);
        if (activeSlots.length < 2) {
            alert("Upload at least 2 references to fuse.");
            return;
        }

        setIsFusing(true);
        analytics.action('style_fusion_started', 'fusion');
        try {
            const references = activeSlots.map(s => ({
                role: s.role,
                data: s.data!.split(',')[1],
                mimeType: s.mimeType!
            }));
            const dna = await geminiService.fuseStyles(references);
            onFused(dna);
            analytics.aiEvent('style_fusion', true);
        } catch (err) {
            console.error(err);
            alert("Fusion failed.");
        } finally {
            setIsFusing(false);
        }
    };

    const clearSlot = (role: FusionRole) => {
        setSlots(prev => prev.map(s => s.role === role ? { ...s, data: null, mimeType: null } : s));
    };

    return (
        <div className="space-y-12">
            <header className="space-y-4">
                <h2 className="text-5xl font-black text-white tracking-tighter uppercase">Reference Fusion</h2>
                <p className="text-lg text-zinc-500 font-medium max-w-xl">
                    Siphon characteristics from multiple sources. Poster A for palettes, Poster B for fonts, Poster C for structure.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {slots.map((slot) => (
                    <FusionCard 
                        key={slot.role} 
                        slot={slot} 
                        onUpload={(e) => handleUpload(slot.role, e)} 
                        onClear={() => clearSlot(slot.role)}
                    />
                ))}
            </div>

            <div className="flex justify-center pt-12">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={runFusion}
                    disabled={isFusing || slots.filter(s => s.data).length < 2}
                    className="px-16 py-8 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl shadow-purple-900/40 disabled:opacity-50 flex items-center gap-4 text-lg border border-white/10"
                >
                    {isFusing ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                        <Sparkles className="w-8 h-8 fill-current" />
                    )}
                    <span>Synthesize Fragment</span>
                </motion.button>
            </div>
        </div>
    );
}

function FusionCard({ slot, onUpload, onClear }: any) {
    const roleConfig = {
        colors: { icon: Palette, title: 'Color Source', desc: 'Siphon gradients' },
        typography: { icon: Type, title: 'Type Source', desc: 'Sync font markers' },
        layout: { icon: Layout, title: 'Layout Source', desc: 'Map structural DNA' },
        portraits: { icon: User, title: 'Portrait Source', desc: 'Frame hierarchy' }
    }[slot.role];

    return (
        <div className="relative glass-surface rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col p-8 space-y-6 aspect-square group transition-all hover:border-primary/40">
            <div className="flex items-center justify-between">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <roleConfig.icon className={`w-8 h-8 ${slot.data ? 'text-primary' : 'text-zinc-700'}`} />
                </div>
                {slot.data && (
                    <button onClick={onClear} className="p-2 hover:bg-white/5 rounded-full text-zinc-500">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="space-y-1">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{roleConfig.title}</h3>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{roleConfig.desc}</p>
            </div>

            <div className="flex-1 flex items-center justify-center relative">
                {slot.data ? (
                    <div className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10">
                        <img src={slot.data} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Zap className="w-8 h-8 text-white fill-current" />
                        </div>
                    </div>
                ) : (
                    <label className="w-full h-full border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-all">
                        <Upload className="w-6 h-6 text-zinc-800" />
                        <span className="text-[8px] font-black text-zinc-800 uppercase tracking-widest">Select Reference</span>
                        <input type="file" hidden onChange={onUpload} />
                    </label>
                )}
            </div>
        </div>
    );
}

