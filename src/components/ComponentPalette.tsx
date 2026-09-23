import React from 'react';
import type { LogicType } from '../types/simulator';
import { ToggleRight, Lightbulb, Cpu, Plus } from 'lucide-react';

interface ComponentPaletteProps {
  onAddComponent: (type: LogicType) => void;
}

interface ComponentItem {
  type: LogicType;
  label: string;
  category: 'io' | 'basic' | 'universal';
  formula: string;
  description: string;
}

const PALETTE_ITEMS: ComponentItem[] = [
  {
    type: 'INPUT',
    label: 'Input Switch',
    category: 'io',
    formula: '0 / 1',
    description: 'Saklar toggle sinyal High/Low manual',
  },
  {
    type: 'OUTPUT',
    label: 'Output LED',
    category: 'io',
    formula: 'Indicator',
    description: 'Lampu indikator penerima status sinyal',
  },
  {
    type: 'AND',
    label: 'AND Gate',
    category: 'basic',
    formula: 'Y = A · B',
    description: 'High jika semua input bernilai High',
  },
  {
    type: 'OR',
    label: 'OR Gate',
    category: 'basic',
    formula: 'Y = A + B',
    description: 'High jika salah satu input bernilai High',
  },
  {
    type: 'NOT',
    label: 'NOT Inverter',
    category: 'basic',
    formula: 'Y = ¬A',
    description: 'Membalikkan sinyal input (0 ⇄ 1)',
  },
  {
    type: 'XOR',
    label: 'XOR Gate',
    category: 'universal',
    formula: 'Y = A ⊕ B',
    description: 'High jika hanya salah satu input High',
  },
  {
    type: 'NAND',
    label: 'NAND Gate',
    category: 'universal',
    formula: 'Y = ¬(A · B)',
    description: 'Inversi dari gerbang AND',
  },
  {
    type: 'NOR',
    label: 'NOR Gate',
    category: 'universal',
    formula: 'Y = ¬(A + B)',
    description: 'Inversi dari gerbang OR',
  },
];

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({ onAddComponent }) => {
  const handleDragStart = (e: React.DragEvent, type: LogicType) => {
    e.dataTransfer.setData('application/reactflow-type', type);
    e.dataTransfer.setData('text/plain', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const ioItems = PALETTE_ITEMS.filter((i) => i.category === 'io');
  const basicItems = PALETTE_ITEMS.filter((i) => i.category === 'basic');
  const universalItems = PALETTE_ITEMS.filter((i) => i.category === 'universal');

  const renderItem = (item: ComponentItem) => {
    return (
      <div
        key={item.type}
        draggable
        onDragStart={(e) => handleDragStart(e, item.type)}
        onClick={() => onAddComponent(item.type)}
        className="group relative flex items-center justify-between p-2.5 rounded-lg border border-slate-700/80 bg-slate-850 hover:bg-slate-750 hover:border-slate-500 cursor-grab active:cursor-grabbing transition-all select-none shadow-sm hover:shadow"
        title={`${item.label} (${item.formula}) - Klik atau seret ke canvas`}
        role="button"
        tabIndex={0}
        aria-label={`Tambah ${item.label}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onAddComponent(item.type);
          }
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:border-emerald-500/60 group-hover:text-emerald-400 transition-colors">
            {item.type === 'INPUT' && <ToggleRight className="w-4 h-4 text-emerald-400" />}
            {item.type === 'OUTPUT' && <Lightbulb className="w-4 h-4 text-amber-400" />}
            {item.type !== 'INPUT' && item.type !== 'OUTPUT' && <Cpu className="w-4 h-4 text-sky-400" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                {item.label}
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 truncate">{item.formula}</p>
          </div>
        </div>

        <button
          type="button"
          tabIndex={-1}
          className="opacity-0 group-hover:opacity-100 p-1 rounded bg-slate-700 hover:bg-emerald-600 text-slate-300 hover:text-white transition-all"
          title="Tambah ke canvas"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  return (
    <aside className="w-64 bg-slate-800/95 border-r border-slate-700/80 flex flex-col h-full overflow-hidden select-none z-10 shadow-lg">
      <div className="p-3 border-b border-slate-700/80 bg-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold tracking-wider uppercase text-slate-300">Komponen Logika</h2>
          <p className="text-[11px] text-slate-400">Klik atau seret ke area canvas</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* I/O Section */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
            Input & Output
          </div>
          <div className="space-y-1.5">{ioItems.map(renderItem)}</div>
        </div>

        {/* Basic Gates Section */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
            Gerbang Dasar
          </div>
          <div className="space-y-1.5">{basicItems.map(renderItem)}</div>
        </div>

        {/* Universal & Derived Section */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
            Gerbang Kombinasi
          </div>
          <div className="space-y-1.5">{universalItems.map(renderItem)}</div>
        </div>
      </div>

      {/* Quick Tips Footer */}
      <div className="p-3 border-t border-slate-700/80 bg-slate-900/60 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 font-medium text-slate-300 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Navigasi Cepat</span>
        </div>
        <p className="text-[10px] leading-relaxed">
          Tarik pin <strong>OUT</strong> ke pin <strong>IN</strong> untuk menghubungkan sinyal. Tekan{' '}
          <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[9px] text-slate-300">
            Del
          </kbd>{' '}
          untuk menghapus.
        </p>
      </div>
    </aside>
  );
};
