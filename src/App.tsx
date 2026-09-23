import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  LogicType,
  CircuitState,
  ToastNotification,
  Wire,
} from './types/simulator';
import { evaluateCircuit } from './utils/logicEvaluator';
import { generateTruthTable } from './utils/truthTableGenerator';
import { PRESET_CIRCUITS, createNode } from './presets/presetCircuits';
import { HeaderBar } from './components/HeaderBar';
import { ComponentPalette } from './components/ComponentPalette';
import { SimulationCanvas } from './components/SimulationCanvas';
import { TruthTablePanel } from './components/TruthTablePanel';
import { ModalHelp } from './components/ModalHelp';
import { Smartphone, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const STORAGE_KEY = 'gatelab_circuit_state_v1';

export const App: React.FC = () => {
  // Load initial circuit state from localStorage or default to Half Adder preset
  const [circuit, setCircuit] = useState<CircuitState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CircuitState;
        if (Array.isArray(parsed.nodes) && Array.isArray(parsed.wires)) {
          return parsed;
        }
      }
    } catch {
      // Fallback on parse failure
    }
    // Default initial circuit: Half Adder
    const defaultPreset = PRESET_CIRCUITS[0];
    return defaultPreset ? defaultPreset.circuit : { nodes: [], wires: [] };
  });

  // UI States
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [isTruthTableOpen, setIsTruthTableOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isDismissMobileWarning, setIsDismissMobileWarning] = useState<boolean>(false);

  // Auto-persist to localStorage on state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(circuit));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [circuit]);

  // Toast Notification Trigger
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // Real-time Circuit Signal Evaluation
  const evaluationResult = useMemo(() => {
    return evaluateCircuit(circuit.nodes, circuit.wires);
  }, [circuit.nodes, circuit.wires]);

  const errorWireSet = useMemo(() => {
    return new Set(evaluationResult.errorWireIds);
  }, [evaluationResult.errorWireIds]);

  // Real-time Truth Table Generation
  const truthTableData = useMemo(() => {
    return generateTruthTable(circuit.nodes, circuit.wires);
  }, [circuit.nodes, circuit.wires]);

  // Node Actions
  const handleAddComponent = useCallback((type: LogicType, x = 240, y = 160) => {
    const newNode = createNode(type, x, y);
    setCircuit((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
    setSelectedNodeId(newNode.id);
  }, []);

  const handleUpdateNodePosition = useCallback((nodeId: string, x: number, y: number) => {
    setCircuit((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n)),
    }));
  }, []);

  const handleToggleInput = useCallback((nodeId: string) => {
    setCircuit((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) =>
        n.id === nodeId ? { ...n, state: !n.state } : n
      ),
    }));
  }, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setCircuit((prev) => ({
      nodes: prev.nodes.filter((n) => n.id !== nodeId),
      // Automatically clean up any wires attached to this node
      wires: prev.wires.filter(
        (w) => w.fromNodeId !== nodeId && w.toNodeId !== nodeId
      ),
    }));
    setSelectedNodeId(null);
  }, []);

  // Wire Actions
  const handleAddWire = useCallback((newWire: Wire) => {
    setCircuit((prev) => ({
      ...prev,
      wires: [...prev.wires, newWire],
    }));
  }, []);

  const handleDeleteWire = useCallback((wireId: string) => {
    setCircuit((prev) => ({
      ...prev,
      wires: prev.wires.filter((w) => w.id !== wireId),
    }));
    setSelectedWireId(null);
  }, []);

  // Preset Circuits
  const handleLoadPreset = useCallback((presetId: string) => {
    const preset = PRESET_CIRCUITS.find((p) => p.id === presetId);
    if (!preset) return;

    setCircuit(JSON.parse(JSON.stringify(preset.circuit)));
    setSelectedNodeId(null);
    setSelectedWireId(null);
    showToast(`Preset "${preset.name}" berhasil dimuat`, 'success');
  }, [showToast]);

  // Reset Canvas
  const handleResetCanvas = useCallback(() => {
    setCircuit({ nodes: [], wires: [] });
    setSelectedNodeId(null);
    setSelectedWireId(null);
    showToast('Canvas sirkuit telah dibersihkan', 'info');
  }, [showToast]);

  // Export JSON
  const handleExportJSON = useCallback(() => {
    try {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(circuit, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `gatelab-circuit-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('Sirkuit berhasil diekspor ke berkas JSON', 'success');
    } catch {
      showToast('Gagal mengekspor data sirkuit', 'error');
    }
  }, [circuit, showToast]);

  // Import JSON
  const handleImportJSON = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content) as CircuitState;

        if (Array.isArray(parsed.nodes) && Array.isArray(parsed.wires)) {
          setCircuit(parsed);
          setSelectedNodeId(null);
          setSelectedWireId(null);
          showToast('Sirkuit berhasil diimpor dari berkas JSON', 'success');
        } else {
          showToast('Format berkas JSON sirkuit tidak valid', 'error');
        }
      } catch {
        showToast('Terjadi kesalahan saat membaca berkas JSON', 'error');
      }
    };
    reader.readAsText(file);
  }, [showToast]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-900 text-slate-100 overflow-hidden font-sans select-none">
      {/* Mobile Warning Banner (< 768px) */}
      {!isDismissMobileWarning && (
        <div className="md:hidden bg-amber-950/90 border-b border-amber-600/40 text-amber-200 px-3 py-1.5 text-xs flex items-center justify-between shrink-0 z-50">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Optimal pada layar Tablet/Desktop untuk interaksi canvas presisi.</span>
          </div>
          <button
            type="button"
            onClick={() => setIsDismissMobileWarning(true)}
            aria-label="Tutup Peringatan Mobile"
            className="p-1 text-amber-300 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Top Header Bar */}
      <HeaderBar
        hasCycle={evaluationResult.hasCycle}
        snapToGrid={snapToGrid}
        isTruthTableOpen={isTruthTableOpen}
        onToggleSnapToGrid={() => setSnapToGrid((prev) => !prev)}
        onResetCanvas={handleResetCanvas}
        onLoadPreset={handleLoadPreset}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onToggleTruthTable={() => setIsTruthTableOpen((prev) => !prev)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Workspace Area: Component Palette + Canvas + Truth Table */}
      <div className="flex flex-1 h-[calc(100vh-3.5rem)] relative overflow-hidden">
        {/* Left Component Palette */}
        <ComponentPalette onAddComponent={handleAddComponent} />

        {/* Central Simulation Canvas */}
        <main className="flex-1 relative h-full overflow-hidden bg-slate-900">
          <SimulationCanvas
            nodes={circuit.nodes}
            wires={circuit.wires}
            wireValues={evaluationResult.wireValues}
            pinValues={evaluationResult.pinValues}
            nodeOutputs={evaluationResult.nodeOutputs}
            errorWireIds={errorWireSet}
            snapToGrid={snapToGrid}
            selectedNodeId={selectedNodeId}
            selectedWireId={selectedWireId}
            onSelectNode={setSelectedNodeId}
            onSelectWire={setSelectedWireId}
            onUpdateNodePosition={handleUpdateNodePosition}
            onToggleInput={handleToggleInput}
            onDeleteNode={handleDeleteNode}
            onDeleteWire={handleDeleteWire}
            onAddWire={handleAddWire}
            onAddComponentAt={handleAddComponent}
            onShowToast={showToast}
          />
        </main>

        {/* Right Truth Table Panel */}
        <TruthTablePanel
          isOpen={isTruthTableOpen}
          onClose={() => setIsTruthTableOpen(false)}
          data={truthTableData}
          currentNodes={circuit.nodes}
        />
      </div>

      {/* Help Modal */}
      <ModalHelp isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Floating Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-xs font-medium shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 duration-150 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/80 text-rose-200'
                : 'bg-slate-800/90 border-slate-700 text-slate-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
