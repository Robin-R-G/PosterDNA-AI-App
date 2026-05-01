/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Upload, Camera, FileText, Image as ImageIcon, Loader2, CheckCircle2, ChevronRight, Zap, Target, User, Star, Trash2, Edit3, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, ChangeEvent } from 'react';
import { geminiService } from '../services/geminiService';
import { DNAAnalysis, Face } from '../types';
import { analytics } from '../services/analyticsService';

export default function Analyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DNAAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setAnalysis(null);
      setError(null);
      analytics.action('file_selected', 'analyzer', selectedFile.type);
    }
  };

  const startAnalysis = async () => {
    if (!preview || !file) return;

    setIsAnalyzing(true);
    setError(null);
    analytics.action('analysis_started', 'analyzer');

    try {
      const base64Data = preview.split(',')[1];
      const result = await geminiService.analyzePoster(base64Data, file.type);
      setAnalysis(result);
      analytics.aiEvent('poster_analysis', true);
    } catch (err) {
      console.error(err);
      setError("AI Analysis failed. Please try a different image.");
      analytics.aiEvent('poster_analysis', false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateFace = (faceId: string, updates: Partial<Face>) => {
    if (!analysis) return;
    setAnalysis({
      ...analysis,
      faces: analysis.faces.map(f => f.id === faceId ? { ...f, ...updates } : f)
    });
  };

  const deleteFace = (faceId: string) => {
    if (!analysis) return;
    setAnalysis({
      ...analysis,
      faces: analysis.faces.filter(f => f.id !== faceId)
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase">Visual DNA Decoder</h2>
        <p className="text-on-surface-variant max-w-xl mx-auto text-lg font-medium">
          Multi-modal analysis for English & Malayalam designs. Extract layers, faces, and semantic tokens.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Source Column */}
        <div className="xl:col-span-4 space-y-8">
          <div className="glass-surface p-8 rounded-[3rem] border border-white/5 space-y-8 sticky top-24">
            <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-900 flex flex-col items-center justify-center relative group shadow-2xl border border-white/5">
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                    <button 
                      onClick={() => { setPreview(null); setAnalysis(null); }}
                      className="px-8 py-3 bg-secondary text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl"
                    >
                      Clear Source
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-6 text-zinc-600">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                    <Upload className="w-10 h-10" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-center px-12">
                    Drag source here
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <SourceButton icon={ImageIcon} label="Gallery" color="primary" onClick={() => fileInputRef.current?.click()} />
              <SourceButton icon={Camera} label="Camera" color="secondary" onClick={() => cameraInputRef.current?.click()} />
              <SourceButton icon={FileText} label="PDF Scan" color="tertiary" onClick={() => fileInputRef.current?.click()} />
            </div>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*,application/pdf" />
            <input type="file" ref={cameraInputRef} onChange={handleFileChange} hidden accept="image/*" capture="environment" />

            {preview && !analysis && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={startAnalysis}
                disabled={isAnalyzing}
                className="w-full py-6 bg-tertiary text-zinc-950 font-black uppercase tracking-[0.3em] text-xs rounded-3xl shadow-[0_20px_50px_rgba(233,196,0,0.2)] disabled:opacity-50 flex items-center justify-center gap-4 group"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Decoding...
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6 fill-current group-hover:animate-bounce" />
                    Initialize Scan
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>

        {/* Intelligence Column */}
        <div className="xl:col-span-8 space-y-12">
          <AnimatePresence mode="wait">
            {analysis ? (
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-12 pb-24"
              >
                {/* OCR & Semantic Group */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Type className="w-6 h-6 text-primary" />
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white">Semantic Extraction</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SemanticBox label="Titles" items={analysis.text.titles} />
                    <SemanticBox label="Metadata" items={[...analysis.text.phoneNumbers, ...analysis.text.dates, ...analysis.text.addresses]} />
                    <div className="md:col-span-2 glass-surface p-6 rounded-3xl border border-white/5 space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-outline">OCR Logic (En/Mal)</p>
                      <p className="text-zinc-400 text-sm leading-relaxed font-medium bg-black/20 p-4 rounded-xl border border-white/5 italic">
                        "{analysis.text.ocrRaw}"
                      </p>
                    </div>
                  </div>
                </section>

                {/* Face Intelligence */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="w-6 h-6 text-secondary" />
                      <h3 className="text-2xl font-black uppercase tracking-tight text-white">Face Cards</h3>
                    </div>
                    <span className="px-4 py-1 bg-secondary/10 text-secondary text-[10px] font-black rounded-full border border-secondary/20">
                      {analysis.faces.length} DETECTED
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence>
                      {analysis.faces.map((face) => (
                        <motion.div
                          key={face.id}
                          layout
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          className={`glass-surface p-6 rounded-[2rem] border transition-all ${face.isHero ? 'border-tertiary/40 ring-1 ring-tertiary/20' : 'border-white/5'}`}
                        >
                          <div className="flex items-start justify-between mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center relative overflow-hidden group">
                              <Target className="w-8 h-8 text-zinc-600 group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => updateFace(face.id, { isHero: !face.isHero })}
                                className={`p-2 rounded-xl transition-all ${face.isHero ? 'bg-tertiary text-zinc-950' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}
                              >
                                <Star className={`w-5 h-5 ${face.isHero ? 'fill-current' : ''}`} />
                              </button>
                              <button 
                                onClick={() => deleteFace(face.id)}
                                className="p-2 rounded-xl bg-white/5 text-zinc-500 hover:bg-secondary/20 hover:text-secondary transition-all"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                                <Edit3 className="w-3 h-3" /> Identity Label
                              </label>
                              <input 
                                type="text" 
                                value={face.name}
                                onChange={(e) => updateFace(face.id, { name: e.target.value })}
                                className="w-full bg-transparent text-white font-bold border-b border-white/10 pb-2 focus:border-tertiary outline-none transition-colors"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Priority Weight</label>
                                <span className="text-xs font-black text-white">{face.priority}</span>
                              </div>
                              <input 
                                type="range" 
                                min="1" max="10" 
                                value={face.priority}
                                onChange={(e) => updateFace(face.id, { priority: parseInt(e.target.value) })}
                                className="w-full accent-tertiary h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </section>

                <div className="flex gap-4">
                  <button className="flex-1 py-6 bg-white/5 text-white font-black uppercase tracking-[0.2em] text-xs rounded-3xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                    Refine with Copilot
                  </button>
                  <button className="flex-1 py-6 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-3xl shadow-xl shadow-purple-900/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                    Reconstruct Design
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ) : isAnalyzing ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-8 bg-zinc-900/30 rounded-[4rem] border border-dashed border-white/5">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-t-tertiary border-zinc-800 animate-spin" />
                  <Zap className="absolute inset-0 m-auto w-10 h-10 text-tertiary animate-pulse" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight">Intelligence Active</h3>
                  <p className="text-zinc-500 font-medium max-w-sm mx-auto">
                    Segmenting faces, mapping layout hierarchy, and parsing multilingual OCR tokens.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6 bg-zinc-900/20 rounded-[4rem] border border-dashed border-white/5">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                  <Target className="w-10 h-10 text-zinc-800" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-bold text-on-surface-variant">Intelligence Payload Pending</p>
                  <p className="text-sm text-zinc-600 font-medium">Results will populate here after DNA sequence is decoded.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function SourceButton({ icon: Icon, label, color, onClick }: { icon: any, label: string, color: 'primary' | 'secondary' | 'tertiary', onClick: () => void }) {
  const colors = {
    primary: 'hover:text-primary',
    secondary: 'hover:text-secondary',
    tertiary: 'hover:text-tertiary'
  };
  
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-3 p-6 glass-surface rounded-[2rem] hover:bg-white/5 transition-all text-on-surface-variant ${colors[color]} border border-white/5 group`}
    >
      <Icon className="w-7 h-7 group-hover:scale-110 transition-transform" />
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function SemanticBox({ label, items }: { label: string, items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="glass-surface p-6 rounded-3xl border border-white/5 space-y-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-outline">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="px-3 py-1.5 bg-white/5 rounded-xl text-xs font-bold text-white border border-white/5">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
