/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { useState, useCallback, useRef } from 'react';
import { Layer } from '../types';
import { 
  Eye, EyeOff, Lock, Unlock, Copy, Trash2, 
  ZoomIn, ZoomOut, Maximize,
  Undo2, Redo2, Move, Hand, User
} from 'lucide-react';

interface CanvasProps {
  layers: Layer[];
  onUpdateLayers: (layers: Layer[]) => void;
}

export default function Canvas({ layers, onUpdateLayers }: CanvasProps) {
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [history, setHistory] = useState<Layer[][]>([layers]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const canvasRef = useRef<HTMLDivElement>(null);

  const pushToHistory = useCallback((newLayers: Layer[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newLayers)));
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      onUpdateLayers(JSON.parse(JSON.stringify(history[prevIndex])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      onUpdateLayers(JSON.parse(JSON.stringify(history[nextIndex])));
    }
  };

  const updateLayer = (layerId: string, updates: Partial<Layer>) => {
    const newLayers = layers.map(l => l.id === layerId ? { ...l, ...updates } : l);
    onUpdateLayers(newLayers);
    pushToHistory(newLayers);
  };

  const deleteLayer = (layerId: string) => {
    const newLayers = layers.filter(l => l.id !== layerId);
    onUpdateLayers(newLayers);
    pushToHistory(newLayers);
    setSelectedLayerId(null);
  };

  const duplicateLayer = (layerId: string) => {
    const layerToDup = layers.find(l => l.id === layerId);
    if (layerToDup) {
      const newLayer = { ...layerToDup, id: `${layerToDup.id}-copy-${Date.now()}` };
      const newLayers = [...layers, newLayer];
      onUpdateLayers(newLayers);
      pushToHistory(newLayers);
      setSelectedLayerId(newLayer.id);
    }
  };

  return (
    <div className="relative w-full h-[70vh] glass-surface rounded-[2rem] overflow-hidden border border-white/5 bg-zinc-950/50 flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between backdrop-blur-md bg-black/20 z-10">
        <div className="flex items-center gap-2">
          <ToolbarButton icon={Undo2} onClick={undo} disabled={historyIndex === 0} label="Undo" />
          <ToolbarButton icon={Redo2} onClick={redo} disabled={historyIndex === history.length - 1} label="Redo" />
          <div className="w-px h-6 bg-white/10 mx-2" />
          <ToolbarButton icon={isPanning ? Hand : Move} onClick={() => setIsPanning(!isPanning)} active={isPanning} label="Pan Mode" />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
            <ToolbarButton icon={ZoomOut} onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} label="Zoom Out" />
            <span className="text-[10px] font-black text-zinc-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <ToolbarButton icon={ZoomIn} onClick={() => setZoom(z => Math.min(3, z + 0.1))} label="Zoom In" />
          </div>
          <ToolbarButton icon={Maximize} onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} label="Reset View" />
        </div>
      </div>

      {/* Main Canvas Area */}
      <div 
        ref={canvasRef}
        className={`flex-1 relative cursor-${isPanning ? 'grab' : 'crosshair'}`}
        onMouseDown={(e) => {
          if (isPanning) {
            const startX = e.pageX - pan.x;
            const startY = e.pageY - pan.y;
            const handleMouseMove = (mmE: MouseEvent) => {
              setPan({ x: mmE.pageX - startX, y: mmE.pageY - startY });
            };
            const handleMouseUp = () => {
              window.removeEventListener('mousemove', handleMouseMove);
              window.removeEventListener('mouseup', handleMouseUp);
            };
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
          }
        }}
      >
        <motion.div 
          animate={{ x: pan.x, y: pan.y, scale: zoom }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="aspect-[4/5] h-[80%] bg-white shadow-2xl relative overflow-hidden pointer-events-auto origin-center">
            {layers.filter(l => !l.isHidden).map((layer) => (
              <LayerItem 
                key={layer.id} 
                layer={layer} 
                isSelected={selectedLayerId === layer.id}
                onSelect={() => !layer.isLocked && setSelectedLayerId(layer.id)}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Layer Panel (Overlay) */}
      <div className="absolute right-6 top-24 w-64 glass-surface p-6 rounded-[2rem] border border-white/5 space-y-6 shadow-2xl z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-outline">Layer Stack</h3>
          <span className="text-[10px] font-black text-zinc-500">{layers.length} Layers</span>
        </div>
        
        <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
          {layers.map((layer) => (
            <div 
              key={layer.id}
              onClick={() => setSelectedLayerId(layer.id)}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                selectedLayerId === layer.id ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-transparent hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-black uppercase text-zinc-500`}>
                  {layer.type[0]}
                </div>
                <div className="truncate w-24">
                  <p className="text-[10px] font-black text-white truncate">{layer.type.toUpperCase()}</p>
                  <p className="text-[8px] text-zinc-500 truncate">{layer.content || 'No content'}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <IconButton 
                  icon={layer.isHidden ? EyeOff : Eye} 
                  onClick={() => updateLayer(layer.id, { isHidden: !layer.isHidden })}
                />
                <IconButton 
                  icon={layer.isLocked ? Lock : Unlock} 
                  onClick={() => updateLayer(layer.id, { isLocked: !layer.isLocked })}
                  active={layer.isLocked}
                />
                <IconButton icon={Copy} onClick={() => duplicateLayer(layer.id)} />
                <IconButton icon={Trash2} onClick={() => deleteLayer(layer.id)} danger />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LayerItem({ layer, isSelected, onSelect }: any) {
  return (
    <motion.div
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      style={{
        ...layer.style,
        position: 'absolute',
        border: isSelected ? '2px solid #a855f7' : 'none',
        pointerEvents: 'auto'
      }}
      className={`group cursor-pointer ${layer.isLocked ? 'cursor-not-allowed' : ''}`}
    >
      {layer.type === 'text' && (
        <span className="text-black font-bold whitespace-nowrap leading-none select-none">{layer.content}</span>
      )}
      {layer.type === 'portrait' && (
        <div className="w-full h-full bg-zinc-200 flex items-center justify-center">
            <User className="text-zinc-400" />
        </div>
      )}
      {layer.type === 'logo' && (
        <div className="w-full h-full flex items-center justify-center p-2">
            <span className="text-[10px] font-black text-zinc-950/40 uppercase tracking-widest">Logo</span>
        </div>
      )}
    </motion.div>
  );
}

function ToolbarButton({ icon: Icon, onClick, disabled, active, label }: { icon: any, onClick: () => void, disabled?: boolean, active?: boolean, label: string }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`p-2 rounded-xl transition-all ${
        active 
          ? 'bg-primary text-white shadow-lg' 
          : 'text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-20'
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function IconButton({ icon: Icon, onClick, active, danger }: { icon: any, onClick: (e: any) => void, active?: boolean, danger?: boolean }) {
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      className={`p-1.5 rounded-lg transition-all ${
        active ? 'text-primary' : 
        danger ? 'hover:text-secondary' : 'hover:text-white'
      } text-zinc-600`}
    >
      <Icon className="w-3 h-3" />
    </button>
  );
}
