import React from 'react';
import { X, HelpCircle, Keyboard, Zap, GitCommit, ShieldAlert } from 'lucide-react';

interface ModalHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalHelp: React.FC<ModalHelpProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700 bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-title" className="text-base font-bold text-slate-100">
                Panduan Penggunaan GateLab
              </h2>
              <p className="text-xs text-slate-400">Simulator Sirkuit Logika Interaktif</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Panduan"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-slate-300 text-xs leading-relaxed">
          {/* Section: Cara Menggunakan */}
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-emerald-400" />
              Alur Kerja Simulasi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700/60 space-y-1">
                <span className="font-semibold text-slate-200">1. Tambah Komponen</span>
                <p className="text-slate-400">
                  Tarik komponen dari sidebar kiri ke canvas, atau cukup klik komponen untuk menambahkan otomatis ke tengah layar.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700/60 space-y-1">
                <span className="font-semibold text-slate-200">2. Hubungkan Kabel (Wiring)</span>
                <p className="text-slate-400">
                  Klik atau seret dari pin <strong className="text-emerald-400">OUT</strong> pada satu node ke pin{' '}
                  <strong className="text-sky-400">IN</strong> node lain.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700/60 space-y-1">
                <span className="font-semibold text-slate-200">3. Uji Sinyal Real-time</span>
                <p className="text-slate-400">
                  Klik saklar <strong>Input Switch</strong> untuk mengganti sinyal 0 (Low) dan 1 (High). Sinyal langsung dihitung secara sinkron ke Output LED.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700/60 space-y-1">
                <span className="font-semibold text-slate-200">4. Analisis & Preset</span>
                <p className="text-slate-400">
                  Buka <strong>Tabel Kebenaran</strong> untuk matriks $2^N$ kombinasi lengkap, atau gunakan preset Half Adder dan MUX 2:1.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Validasi & Aturan Sirkuit */}
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Aturan & Validasi Koneksi
            </h3>
            <ul className="space-y-2 list-disc list-inside text-slate-400">
              <li>
                <strong className="text-slate-200">1 Kabel per Pin Input:</strong> Pin input hanya dapat menerima satu sumber sinyal.
              </li>
              <li>
                <strong className="text-slate-200">Tipe Pin Valid:</strong> Kabel hanya dapat menghubungkan pin Output ke pin Input (mencegah benturan sinyal).
              </li>
              <li>
                <strong className="text-slate-200">Deteksi Siklus (Feedback Loop):</strong> Koneksi melingkar tak berujung akan ditandai dengan kabel merah rose dan evaluasi dihentikan secara aman.
              </li>
            </ul>
          </div>

          {/* Section: Keyboard Shortcuts */}
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-3">
              <Keyboard className="w-4 h-4 text-sky-400" />
              Pintasan Keyboard (Shortcuts)
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-900/60 border border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-400">Hapus elemen terpilih</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 text-slate-200 font-bold">
                  Delete / Backspace
                </kbd>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-400">Batal pasang kabel</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 text-slate-200 font-bold">
                  Escape
                </kbd>
              </div>
            </div>
          </div>

          {/* Section: Formula Gerbang Logika */}
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-3">
              <GitCommit className="w-4 h-4 text-purple-400" />
              Tabel Referensi Gerbang Logika
            </h3>
            <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-800 border-b border-slate-700 text-slate-300 font-mono">
                    <th className="py-2 px-3">Gerbang</th>
                    <th className="py-2 px-3">Persamaan Boolean</th>
                    <th className="py-2 px-3">Aturan Logika</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                  <tr>
                    <td className="py-1.5 px-3 font-bold text-emerald-400">AND</td>
                    <td className="py-1.5 px-3">Y = A · B</td>
                    <td className="py-1.5 px-3 text-slate-400 font-sans">1 hanya jika kedua input bernilai 1</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-bold text-sky-400">OR</td>
                    <td className="py-1.5 px-3">Y = A + B</td>
                    <td className="py-1.5 px-3 text-slate-400 font-sans">1 jika salah satu atau kedua input bernilai 1</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-bold text-amber-400">NOT</td>
                    <td className="py-1.5 px-3">Y = ¬A</td>
                    <td className="py-1.5 px-3 text-slate-400 font-sans">Inversi sinyal (0 ⇄ 1)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-bold text-indigo-400">XOR</td>
                    <td className="py-1.5 px-3">Y = A ⊕ B</td>
                    <td className="py-1.5 px-3 text-slate-400 font-sans">1 jika input berbeda (satu 0 dan satu 1)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-bold text-rose-400">NAND</td>
                    <td className="py-1.5 px-3">Y = ¬(A · B)</td>
                    <td className="py-1.5 px-3 text-slate-400 font-sans">0 hanya jika kedua input bernilai 1</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-bold text-fuchsia-400">NOR</td>
                    <td className="py-1.5 px-3">Y = ¬(A + B)</td>
                    <td className="py-1.5 px-3 text-slate-400 font-sans">1 hanya jika kedua input bernilai 0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-850 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
          >
            Mengerti & Mulai Simulasi
          </button>
        </div>
      </div>
    </div>
  );
};
