/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, Plus, MoreVertical, Zap, Edit2, BrainCircuit, PlusCircle, Loader2, X, Upload, CheckCircle2, ChevronRight, Palette, Type, Layout, Star, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useEffect, useState, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthProvider';
import { BrandIdentity } from '../types';
import { geminiService } from '../services/geminiService';
import { analytics } from '../services/analyticsService';

const INITIAL_IDENTITIES: Omit<BrandIdentity, 'id'>[] = [
  {
    name: 'Neo Minimalist',
    tags: ['Clean', 'High-Contrast'],
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=60',
    colors: ['#000000', '#ffffff', '#a855f7'],
    dna: {
      gradients: ['#000000 to #111111', '#a855f7 to #6b21a8'],
      accentColors: ['#a855f7', '#ffffff'],
      typography: { primary: 'Space Grotesk', secondary: 'Inter', malayalamStyle: 'Modern Sans-Serif' },
      composition: { heroPosition: 'Center-Weighted', portraitStyle: 'Glow Outline', footerStructure: 'Dense Grid', logoPosition: 'Bottom-Right' },
      effects: { glow: 'Soft Purple', shadow: 'Hard Edge' }
    }
  }
];

export default function BrandMemory() {
  const { user } = useAuth();
  const [identities, setIdentities] = useState<BrandIdentity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [brandName, setBrandName] = useState('');
  const [files, setFiles] = useState<{ id: string, data: string, mimeType: string, name: string, size: number }[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [tempDNA, setTempDNA] = useState<BrandIdentity['dna'] | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'identities'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BrandIdentity[];
      setIdentities(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'identities');
    });

    return unsubscribe;
  }, [user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 15) {
      alert("Maximum 15 images allowed");
      return;
    }

    selectedFiles.forEach((file: File) => {
      // Basic duplicate detection by name and size
      if (files.find(f => f.name === file.name && f.size === file.size)) {
        console.warn("Duplicate file detected:", file.name);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFiles(prev => [...prev, { 
          id: Math.random().toString(36).substr(2, 9), 
          data: reader.result as string, 
          mimeType: file.type,
          name: file.name,
          size: file.size
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const startTraining = async () => {
    if (files.length < 5) {
      alert("Minimum 5 images required for accurate pattern detection");
      return;
    }

    setIsTraining(true);
    analytics.action('brand_training_started', 'brand_memory');

    try {
      const images = files.map(f => ({ data: f.data.split(',')[1], mimeType: f.mimeType }));
      const dna = await geminiService.trainBrandDNA(images);
      setTempDNA(dna);
      setWizardStep(4);
      analytics.aiEvent('brand_training', true);
    } catch (err) {
      console.error(err);
      alert("Training failed. Please check your connection.");
    } finally {
      setIsTraining(false);
    }
  };

  const saveBrand = async () => {
    if (!user || !tempDNA) return;

    try {
      await addDoc(collection(db, 'identities'), {
        name: brandName,
        tags: ['AI-Trained', 'DNA-Mapped'],
        imageUrl: files[0].data,
        colors: tempDNA.accentColors,
        dna: tempDNA,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      setShowWizard(false);
      resetWizard();
      analytics.action('brand_saved', 'brand_memory');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'identities');
    }
  };

  const resetWizard = () => {
    setWizardStep(1);
    setBrandName('');
    setFiles([]);
    setTempDNA(null);
  };

  const deleteBrand = async (id: string) => {
    if (confirm("Delete this brand memory?")) {
      await deleteDoc(doc(db, 'identities', id));
    }
  };

  if (loading) {
    return (
      <div className="h-[40vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-tertiary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase">Brand Memory</h2>
          <p className="text-lg text-on-surface-variant max-w-xl font-medium leading-relaxed">
            Train AI with your design history. Extract unified DNA markers for automated consistency.
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-4 px-10 py-5 bg-tertiary text-zinc-950 font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-yellow-900/20 group border border-white/20"
        >
          <Plus className="w-5 h-5" />
          <span>Initialize Memory</span>
        </motion.button>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-24">
        {identities.map((idty) => (
          <BrandCard key={idty.id} brand={idty} onDelete={() => deleteBrand(idty.id)} />
        ))}
        
        {identities.length === 0 && (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4 bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/5">
                <BrainCircuit className="w-16 h-16 text-zinc-800" />
                <div className="space-y-1">
                    <p className="text-xl font-bold text-on-surface-variant">No Brand Memories Found</p>
                    <p className="text-sm text-zinc-600 font-medium">Create your first brand DNA to unlock design automation.</p>
                </div>
            </div>
        )}
      </div>

      {/* Creation Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-3xl" 
              onClick={() => !isTraining && setShowWizard(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative w-full max-w-2xl glass-surface rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-12 space-y-10">
                <header className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-tertiary/10 flex items-center justify-center border border-tertiary/20">
                      <BrainCircuit className="w-5 h-5 text-tertiary" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Step {wizardStep} of 5</span>
                  </div>
                  {!isTraining && (
                    <button onClick={() => setShowWizard(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400">
                      <X className="w-6 h-6" />
                    </button>
                  )}
                </header>

                <div className="min-h-[300px]">
                  {wizardStep === 1 && (
                    <div className="space-y-8">
                      <div className="space-y-4 text-center">
                        <h3 className="text-4xl font-black text-white uppercase tracking-tight">Identity Label</h3>
                        <p className="text-zinc-500 font-medium">What is the name of this design ecosystem?</p>
                      </div>
                      <input 
                        type="text"
                        autoFocus
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="e.g., CRM Revival Ministries"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-xl font-bold text-white focus:border-tertiary outline-none transition-all placeholder:text-zinc-700"
                      />
                      <button 
                        disabled={!brandName}
                        onClick={() => setWizardStep(2)}
                        className="w-full py-6 bg-tertiary text-zinc-950 font-black uppercase tracking-widest rounded-2xl disabled:opacity-50"
                      >
                        Proceed to Evidence
                      </button>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-8">
                      <div className="space-y-4 text-center">
                        <h3 className="text-4xl font-black text-white uppercase tracking-tight">Reference Data</h3>
                        <p className="text-zinc-500 font-medium">Upload {Math.max(0, 5 - files.length)} more images to reach training threshold (5-15 required).</p>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        {files.map(f => (
                          <div key={f.id} className="aspect-square rounded-xl overflow-hidden relative group">
                            <img src={f.data} className="w-full h-full object-cover" />
                            <button onClick={() => removeFile(f.id)} className="absolute top-1 right-1 p-1 bg-black/60 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {files.length < 15 && (
                          <label className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-tertiary/40 hover:bg-tertiary/5 transition-all flex flex-col items-center justify-center cursor-pointer gap-2">
                             <Upload className="w-5 h-5 text-zinc-500" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Upload</span>
                             <input type="file" multiple accept="image/*" onChange={handleFileUpload} hidden />
                          </label>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-8">
                        <span className="text-xs font-black text-tertiary uppercase tracking-widest">{files.length} / 15 Images</span>
                        <button 
                          disabled={files.length < 5}
                          onClick={() => setWizardStep(3)}
                          className="px-10 py-5 bg-primary text-white font-black uppercase tracking-widest rounded-2xl disabled:opacity-50"
                        >
                          Initialize Training
                        </button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="flex flex-col items-center justify-center text-center space-y-12 py-12">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-t-tertiary border-zinc-800 animate-spin" />
                        <BrainCircuit className="absolute inset-0 m-auto w-10 h-10 text-tertiary animate-pulse" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-3xl font-black text-white uppercase tracking-tight">AI Training in Progress</h3>
                        <div className="flex flex-col gap-3 max-w-sm">
                           <TrainingStatus label="Analyzing Color Systems" active />
                           <TrainingStatus label="Mapping Typography Tokens" active />
                           <TrainingStatus label="Identifying Layout Archetypes" active />
                           <TrainingStatus label="Synthesizing Glow/Shadow DNA" />
                        </div>
                      </div>
                      {!isTraining ? (
                        <button 
                            onClick={startTraining}
                            className="px-12 py-6 bg-tertiary text-zinc-950 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-yellow-900/20"
                        >
                            Confirm & Begin Sync
                        </button>
                      ) : (
                        <p className="text-zinc-600 font-bold uppercase tracking-widest animate-pulse">Running Neural Extraction...</p>
                      )}
                    </div>
                  )}

                  {wizardStep === 4 && tempDNA && (
                    <div className="space-y-8">
                       <div className="flex items-center gap-4 text-primary">
                          <CheckCircle2 className="w-8 h-8" />
                          <h3 className="text-4xl font-black text-white uppercase tracking-tight">DNA Mapped</h3>
                       </div>

                       <div className="grid grid-cols-2 gap-6">
                            <DNABite icon={Palette} title="Colors" value={tempDNA.accentColors.join(', ')} />
                            <DNABite icon={Type} title="Typography" value={`${tempDNA.typography.primary} (${tempDNA.typography.malayalamStyle})`} />
                            <DNABite icon={Layout} title="Layout" value={tempDNA.composition.heroPosition} />
                            <DNABite icon={Zap} title="Effects" value={tempDNA.effects.glow} />
                       </div>

                       <div className="p-6 bg-zinc-900/50 rounded-3xl border border-white/5 space-y-2">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Synthesis Report</p>
                            <p className="text-sm font-medium text-zinc-400 italic leading-relaxed">
                                Unified brand memory generated. Consistent patterns detected in {files.length} references. {tempDNA.composition.portraitStyle} identified as primary portrait archetype.
                            </p>
                       </div>

                       <button 
                          onClick={saveBrand}
                          className="w-full py-6 bg-primary text-white font-black uppercase tracking-widest rounded-2xl"
                       >
                         Integrate Brand Memory
                       </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BrandCard({ brand, onDelete }: any) {
    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="group relative glass-surface rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col dna-glow hover:border-tertiary/20 transition-all duration-500"
        >
            <div className="aspect-[4/3] relative overflow-hidden">
                <img src={brand.imageUrl} alt={brand.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                    <button className="p-3 bg-black/60 backdrop-blur-md rounded-xl text-white hover:text-tertiary">
                        <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={onDelete} className="p-3 bg-black/60 backdrop-blur-md rounded-xl text-white hover:text-secondary">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="absolute bottom-6 left-8 right-8">
                    <div className="flex items-center gap-2 mb-2">
                         {brand.colors.map(c => (
                             <div key={c} className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                         ))}
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight truncate">{brand.name}</h3>
                </div>
            </div>

            <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Composition</p>
                        <p className="text-[10px] font-black text-white">{brand.dna?.composition.heroPosition || 'Balanced'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Typography</p>
                        <p className="text-[10px] font-black text-white truncate">{brand.dna?.typography.primary || 'Modern'}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button className="flex-1 py-4 bg-tertiary/10 text-tertiary text-[10px] font-black uppercase tracking-widest rounded-xl border border-tertiary/20 hover:bg-tertiary hover:text-zinc-950 transition-all flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4 fill-current" /> Use Memory
                    </button>
                    <button className="flex-1 py-4 bg-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                        Train More
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

function TrainingStatus({ label, active }: { label: string, active?: boolean }) {
    return (
        <div className={`flex items-center gap-3 transition-opacity ${active ? 'opacity-100' : 'opacity-20'}`}>
            <div className={`w-2 h-2 rounded-full ${active ? 'bg-tertiary animate-pulse' : 'bg-zinc-800'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</span>
        </div>
    );
}

function DNABite({ icon: Icon, title, value }: { icon: any, title: string, value: string }) {
    return (
        <div className="glass-surface p-4 rounded-2xl border border-white/5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-zinc-500">
                <Icon className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest">{title}</span>
            </div>
            <p className="text-[10px] font-black text-white uppercase">{value}</p>
        </div>
    );
}
