/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SearchCode, Sparkles, Fingerprint, ArrowRight, ExternalLink, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthProvider';
import { Page, Project } from '../types';

const INITIAL_PROJECTS: Omit<Project, 'id'>[] = [
  {
    title: 'Cyber Synth Aesthetic',
    editedAt: '2 hours ago',
    tokens: 14,
    status: 'ANALYZED',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBObJsVTob0_h9DEsWtz3TgVF7A9JZ7JbrzEC8RJraxhNpaGiSa2PDQOVnReV1U_Gf9wNmSJOjePoMsycf5AwG8T04n4kzuPGCGGRiW6Id_z6-d7keUorukM7BfjJ3SOwj6EiT4cWw9C4sNaJABScYz7SUv7E179SfPVxxqfaq-e-yzDkzSyAenO9VaKWssupde9HwUlnKdMO8DidFAWnRMVcuoiDAbep3iEtWvf7VZNKyTPLNdIiPg1xLKaIGarmimK9irpxSYmb-e',
  },
  {
    title: 'Brutalist Geometry Vol. 4',
    editedAt: '5 hours ago',
    quality: 'High Fidelity',
    status: 'GENERATED',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAe96aLXRaTm_EFMioG78thG5O6O6dwPwO5mB9EyLOr7pPKsRkW3B9kQ09iWZN_2XKsm91azKDYsc2jOJ-VbwDD2lFB5k53--gFtOe-R_Ts4HKB0hP0kp0jmZqC_J0LvO592_zwKvHGN-mx7aaVUAh7D2lwBtpMrBM3MdMhyLCMwH7vrAQgKlW59LbDx47bFsQmHtHH825plbdq9zU3mcjptjfsr1pAPtkg9NYwdqcOrgcza6I3d_7lnR0gwivH5SKK85RwB7rS2YaT',
  },
  {
    title: 'Luxury Serif Branding',
    editedAt: 'Yesterday',
    layers: 8,
    status: 'DNA MAPPED',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATAfpXVNqgo8XLQz1aeVzEiMgV_F7EYyyYYcZVNZwvgqR8uvAkcscatx41Cw74luFPnkUFnIitdt5PnKiGFJTFrM-x7z4UpUe9ElMHk3SSssw0Zppi3MimydGGYxdWcbspWx0G6H2Yf9KxvD8RGTerHgopD2UfstzZ1_Yem2jU47IMKd9w-TveVUJQOmxoz8vc5c1N1AHrf3ikKQmg_BogjhMyGJKgL8JTljsLIR_8Pnd1Rb0o2OuC5_6zeYa3_S2TtWTaJTSZmcaq',
  },
  {
    title: 'Minimalist Ministry Poster',
    editedAt: '3 days ago',
    layers: 4,
    status: 'DRAFT',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtEMU3LOqr7s8OLEfXp2-yTqfAGyFGuYy52AE9FzUHFKT0N3XGJrUA5wKAZAG_fZCmC_1ojktv2OAcJJNgBIYI34qEuCNT38DEv-cQTBi8b0rpWvkLYm3j-NK3HwA1pxJ9gudUSm7jtzkkqC-mjxEkDKPzkNqT6YGlWP2aLdrSxcGaftYb-BajIOa5R8WRYIEtlwrIplzjeH3AcKERkaQiriS1dApPT36kRkIDTdEWDVTBju4-BlR-Pb8LIj2wIxuB6XEKGSdawvzs',
  }
];

export default function Home({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const { user, isPro } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'projects'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty && loading) {
        // Seed initial projects for new user
        const seedData = async () => {
          try {
            for (const p of INITIAL_PROJECTS) {
              await addDoc(collection(db, 'projects'), {
                ...p,
                userId: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
          } catch (e) {
            handleFirestoreError(e, OperationType.CREATE, 'projects');
          }
        };
        seedData();
      } else {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
        setProjects(data);
        setLoading(false);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });

    return unsubscribe;
  }, [user]);

  if (loading) {
    return (
      <div className="h-[40vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-tertiary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Premium Greeting */}
      <header className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-px w-8 bg-tertiary"></span>
          <span className="text-tertiary text-xs font-semibold uppercase tracking-[0.2em] flex items-center gap-2">
            Workspace Alpha
            {isPro && <span className="h-1.5 w-1.5 rounded-full bg-tertiary animate-pulse" />}
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="text-5xl md:text-6xl font-extrabold dna-gradient-text tracking-tight">
            Welcome, {user?.displayName?.split(' ')[0] || 'Creator'}
          </h2>
          {isPro && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-tertiary/10 border border-tertiary/30 rounded-full">
              <Sparkles className="w-3 h-3 text-tertiary" />
              <span className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em]">Partner Access • Life Time Pro</span>
            </div>
          )}
        </div>
        <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
          Ready to decode your next masterpiece? Your AI Studio is calibrated and synced with your Brand Memory.
        </p>
      </header>

      {/* Feature Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Analyze Poster */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          onClick={() => onNavigate('analyzer')}
          className="glass-card pink-glow rounded-3xl p-8 flex flex-col gap-6 group cursor-pointer"
        >
          <div className="h-14 w-14 rounded-2xl bg-secondary-container/20 flex items-center justify-center border border-secondary/20">
            <SearchCode className="text-secondary w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Analyze Poster</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Extract DNA traits, layout hierarchies, and color palettes from any reference image.
            </p>
          </div>
          <div className="mt-auto pt-4 flex items-center text-secondary text-sm font-bold tracking-widest uppercase">
            <span>Launch Analyzer</span>
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </motion.div>

        {/* AI Studio */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          onClick={() => onNavigate('ai-studio')}
          className="glass-card gold-glow rounded-3xl p-8 flex flex-col gap-6 group cursor-pointer bg-gradient-to-br from-tertiary/5 to-transparent"
        >
          <div className="h-14 w-14 rounded-2xl bg-tertiary-container/20 flex items-center justify-center border border-tertiary/20">
            <Sparkles className="text-tertiary w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">AI Studio</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Generate high-fidelity poster concepts using evolved DNA tokens and generative layers.
            </p>
          </div>
          <div className="mt-auto pt-4 flex items-center text-tertiary text-sm font-bold tracking-widest uppercase">
            <span>Open Canvas</span>
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </motion.div>

        {/* Brand Memory */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          onClick={() => onNavigate('memory')}
          className="glass-card pink-glow rounded-3xl p-8 flex flex-col gap-6 group cursor-pointer"
        >
          <div className="h-14 w-14 rounded-2xl bg-primary-container/20 flex items-center justify-center border border-primary/20">
            <Fingerprint className="text-primary w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Brand Memory</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Your persistent stylistic identity vault. Keep your generations consistent across campaigns.
            </p>
          </div>
          <div className="mt-auto pt-4 flex items-center text-primary text-sm font-bold tracking-widest uppercase">
            <span>Access Vault</span>
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </motion.div>
      </section>

      {/* Recent Projects Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">Recent Projects</h3>
            <p className="text-on-surface-variant text-sm font-medium">Your latest creative explorations</p>
          </div>
          <button className="text-primary text-sm font-bold flex items-center hover:underline tracking-widest uppercase">
            View All <ExternalLink className="w-4 h-4 ml-1.5" />
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
          {projects.map((project) => (
            <motion.div 
              key={project.id}
              whileHover={{ y: -4 }}
              className="min-w-[280px] md:min-w-[320px] snap-start glass-card rounded-2xl overflow-hidden group cursor-pointer border-white/5 hover:border-white/20 transition-all p-0"
            >
              <div className="h-48 w-full relative overflow-hidden">
                <img 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  src={project.imageUrl}
                  alt={project.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    project.status === 'ANALYZED' ? 'text-tertiary' :
                    project.status === 'GENERATED' ? 'text-secondary' : 'text-primary'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
              <div className="p-5 space-y-1">
                <h4 className="text-white font-bold text-lg truncate">{project.title}</h4>
                <p className="text-zinc-500 text-xs font-medium">
                  {project.editedAt} • {project.tokens ? `${project.tokens} DNA Tokens` : project.quality || `${project.layers} Layers`}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Drafts Section */}
      {projects.some(p => p.status === 'DRAFT') && (
        <section className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">Drafts</h3>
            <p className="text-on-surface-variant text-sm font-medium">Continue where you left off</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.filter(p => p.status === 'DRAFT').map((project) => (
              <motion.div 
                key={project.id}
                whileHover={{ x: 4 }}
                className="glass-card flex items-center gap-4 p-4 rounded-2xl group cursor-pointer border-white/5 hover:bg-white/5 transition-all"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                  <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold truncate">{project.title}</h4>
                  <p className="text-zinc-500 text-xs">Saved {project.editedAt}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-primary transition-all" />
              </motion.div>
            ))}
          </div>
        </section>
      )}
      
      {/* AI Assistant FAB */}
      <motion.button 
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-8 h-16 w-16 bg-gradient-to-tr from-tertiary to-tertiary-fixed rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(233,196,0,0.3)] z-50 group border border-white/20"
      >
        <Sparkles className="text-zinc-950 w-8 h-8 font-bold" />
      </motion.button>
    </div>
  );
}
