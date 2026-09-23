import React from 'react';
import type { TruthTableData, GateNode } from '../types/simulator';
import { X, Table2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface TruthTablePanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: TruthTableData;
  currentNodes: GateNode[];
}

export const TruthTablePanel: React.FC<TruthTablePanelProps> = ({
  isOpen,
  onClose,
  data,
  currentNodes,
}) => {
  if (!isOpen) return null;

  // Build current input states to highlight matching row in the truth table
  const currentInputs: Record<string, boolean> = {};
  currentNodes
    .filter((n) => n.type === 'INPUT')
    .forEach((n) => {
      currentInputs[n.id] = n.state;
    });

  const hasContent = data.inputNodes.length > 0 && data.outputNodes.length > 0 && data.rows.length > 0;

  return (
    <aside
      className="fixed right-0 top-14 bottom-0 w-80 sm:w-96 bg-slate-850 border-l border-slate-700/80 z-20 flex flex-col shadow-2xl backdrop-blur-md"
      aria-label="Panel Tabel Kebenaran"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-slate-700/80 flex items-center justify-between bg-slate-800">
        <div className="flex items-center gap-2">
          <Table2 className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-slate-200 tracking-wide">Tabel Kebenaran</h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup Tabel Kebenaran"
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Info / Metadata Banner */}
      <div className="px-3.5 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>
          Input: <strong className="text-slate-200">{data.inputNodes.length}</strong> | Output:{' '}
          <strong className="text-slate-200">{data.outputNodes.length}</strong>
        </span>
        <span>
          Baris: <strong className="text-emerald-400">{data.rows.length}</strong>
        </span>
      </div>

      {data.isExceeded && (
        <div className="p-2.5 mx-3 mt-2 rounded bg-amber-950/50 border border-amber-600/40 text-amber-300 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <span>
            Input &gt; 8 terdeteksi. Tabel dibatasi hingga 256 kombinasi untuk menjaga performa rendering.
          </span>
        </div>
      )}

      {/* Main Table Content */}
      <div className="flex-1 overflow-auto p-3">
        {!hasContent ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-3 text-slate-500">
              <Table2 className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-300 mb-1">Data Belum Lengkap</p>
            <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
              Tambahkan minimal 1 <strong>Input Switch</strong> dan 1 <strong>Output LED</strong> ke canvas,
              lalu hubungkan dengan gerbang logika untuk menghasilkan tabel kebenaran otomatis.
            </p>
          </div>
        ) : (
          <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900 shadow-inner">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800 border-b border-slate-700 text-[11px] font-mono tracking-wider">
                  <th className="py-2 px-1 text-slate-400 font-medium border-r border-slate-700/60 w-8">#</th>
                  {/* Inputs */}
                  {data.inputNodes.map((node) => (
                    <th
                      key={node.id}
                      className="py-2 px-1.5 text-emerald-300 font-semibold border-r border-slate-700/60"
                      title={`Input: ${node.label}`}
                    >
                      <div className="truncate max-w-[60px] mx-auto">{node.label}</div>
                    </th>
                  ))}
                  {/* Outputs */}
                  {data.outputNodes.map((node, idx) => (
                    <th
                      key={node.id}
                      className={`py-2 px-1.5 text-sky-300 font-semibold ${
                        idx < data.outputNodes.length - 1 ? 'border-r border-slate-700/60' : ''
                      }`}
                      title={`Output: ${node.label}`}
                    >
                      <div className="truncate max-w-[60px] mx-auto">{node.label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {data.rows.map((row, idx) => {
                  // Check if this row represents the active state of all inputs
                  const isCurrentActiveRow = data.inputNodes.every(
                    (inNode) => (row.inputs[inNode.id] ?? false) === (currentInputs[inNode.id] ?? false)
                  );

                  return (
                    <tr
                      key={idx}
                      className={`transition-colors ${
                        isCurrentActiveRow
                          ? 'bg-emerald-950/60 ring-1 ring-inset ring-emerald-500/50'
                          : 'hover:bg-slate-800/60'
                      }`}
                    >
                      <td className="py-1.5 px-1 text-[10px] text-slate-400 border-r border-slate-700/60">
                        {isCurrentActiveRow ? (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        ) : (
                          idx + 1
                        )}
                      </td>

                      {/* Inputs values */}
                      {data.inputNodes.map((node) => {
                        const val = row.inputs[node.id] ?? false;
                        return (
                          <td
                            key={node.id}
                            className={`py-1.5 px-1 border-r border-slate-700/60 ${
                              val ? 'text-emerald-400 font-bold' : 'text-slate-400'
                            }`}
                          >
                            {val ? '1' : '0'}
                          </td>
                        );
                      })}

                      {/* Outputs values */}
                      {data.outputNodes.map((node, oIdx) => {
                        const val = row.outputs[node.id] ?? false;
                        return (
                          <td
                            key={node.id}
                            className={`py-1.5 px-1 font-bold ${
                              val ? 'text-emerald-400 bg-emerald-950/20' : 'text-slate-400'
                            } ${oIdx < data.outputNodes.length - 1 ? 'border-r border-slate-700/60' : ''}`}
                          >
                            {val ? '1' : '0'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="p-3 border-t border-slate-700/80 bg-slate-900/40 text-[10px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-300">Baris Aktif (Real-time)</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Sinkron otomatis</span>
        </div>
      </div>
    </aside>
  );
};
