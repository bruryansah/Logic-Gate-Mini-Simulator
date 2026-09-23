import React, { useRef } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  Table2,
  HelpCircle,
  Grid,
  Sparkles,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { PRESET_CIRCUITS } from '../presets/presetCircuits';

interface HeaderBarProps {
  hasCycle: boolean;
  snapToGrid: boolean;
  isTruthTableOpen: boolean;
  onToggleSnapToGrid: () => void;
  onResetCanvas: () => void;
  onLoadPreset: (presetId: string) => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onToggleTruthTable: () => void;
  onOpenHelp: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  hasCycle,
  snapToGrid,
  isTruthTableOpen,
  onToggleSnapToGrid,
  onResetCanvas,
  onLoadPreset,
  onExportJSON,
  onImportJSON,
  onToggleTruthTable,
  onOpenHelp,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
      // Reset input value so re-uploading the same file works
      e.target.value = '';
    }
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-700/80 px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/70 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-mono font-black text-sm shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            GL
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold tracking-tight text-white">GateLab</h1>
              <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Logic Gate Mini Simulator</p>
          </div>
        </div>

        {/* Live status badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-mono">
          {hasCycle ? (
            <div className="flex items-center gap-1 text-rose-400 border-rose-500/30 bg-rose-950/40">
              <AlertCircle className="w-3 h-3 text-rose-400 animate-pulse" />
              <span>Feedback Loop Error</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-emerald-400 border-emerald-500/30 bg-emerald-950/40">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>Simulasi Aktif</span>
            </div>
          )}
        </div>
      </div>

      {/* Preset circuits dropdown */}
      <div className="flex items-center gap-2">
        <div className="relative flex items-center">
          <label htmlFor="preset-select" className="sr-only">Pilih Preset Sirkuit</label>
          <div className="flex items-center gap-1 text-xs text-slate-400 mr-1.5 hidden lg:flex">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Preset:</span>
          </div>
          <select
            id="preset-select"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                onLoadPreset(e.target.value);
                e.target.value = '';
              }
            }}
            aria-label="Pilih Preset Sirkuit"
            className="text-xs bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 rounded-lg px-2.5 py-1.5 font-medium cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="" disabled>
              Muat Preset Sirkuit...
            </option>
            {PRESET_CIRCUITS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-1">
          {/* Snap to Grid */}
          <button
            type="button"
            onClick={onToggleSnapToGrid}
            aria-pressed={snapToGrid}
            aria-label={`Snap ke Grid: ${snapToGrid ? 'Aktif' : 'Nonaktif'}`}
            title={`Snap ke Grid (${snapToGrid ? 'Aktif' : 'Nonaktif'})`}
            className={`p-2 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
              snapToGrid
                ? 'bg-slate-800 border-emerald-500/60 text-emerald-400'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Snap</span>
          </button>

          {/* Reset Canvas */}
          <button
            type="button"
            onClick={onResetCanvas}
            aria-label="Reset Canvas"
            title="Reset Canvas (Kosongkan sirkuit)"
            className="p-2 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Reset</span>
          </button>

          {/* Export JSON */}
          <button
            type="button"
            onClick={onExportJSON}
            aria-label="Ekspor Tata Letak JSON"
            title="Ekspor Sirkuit (JSON)"
            className="p-2 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Ekspor</span>
          </button>

          {/* Import JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
            aria-label="Unggah Berkas JSON Sirkuit"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Impor Tata Letak JSON"
            title="Impor Sirkuit (JSON)"
            className="p-2 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Impor</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

          {/* Toggle Truth Table Panel */}
          <button
            type="button"
            onClick={onToggleTruthTable}
            aria-pressed={isTruthTableOpen}
            aria-label="Buka/Tutup Tabel Kebenaran"
            title="Tabel Kebenaran (Truth Table)"
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
              isTruthTableOpen
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750 hover:text-white'
            }`}
          >
            <Table2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Truth Table</span>
          </button>

          {/* Help Modal Trigger */}
          <button
            type="button"
            onClick={onOpenHelp}
            aria-label="Panduan Penggunaan"
            title="Bantuan & Petunjuk"
            className="p-2 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
