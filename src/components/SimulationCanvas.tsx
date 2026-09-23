import React, { useRef, useState, useEffect, useCallback } from 'react';
import type {
  GateNode as GateNodeType,
  Wire,
  Pin,
  DraggingWire,
  LogicType,
} from '../types/simulator';
import { GateNode } from './GateNode';
import { WireOverlay } from './WireOverlay';
import { getPinAbsolutePosition } from '../utils/coordinateUtils';
import { PlusCircle, Sparkles } from 'lucide-react';

interface SimulationCanvasProps {
  nodes: GateNodeType[];
  wires: Wire[];
  wireValues: Record<string, boolean>;
  pinValues: Record<string, boolean>;
  nodeOutputs: Record<string, boolean>;
  errorWireIds: Set<string>;
  snapToGrid: boolean;
  selectedNodeId: string | null;
  selectedWireId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onSelectWire: (wireId: string | null) => void;
  onUpdateNodePosition: (nodeId: string, x: number, y: number) => void;
  onToggleInput: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteWire: (wireId: string) => void;
  onAddWire: (wire: Wire) => void;
  onAddComponentAt: (type: LogicType, x: number, y: number) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  nodes,
  wires,
  wireValues,
  pinValues,
  nodeOutputs,
  errorWireIds,
  snapToGrid,
  selectedNodeId,
  selectedWireId,
  onSelectNode,
  onSelectWire,
  onUpdateNodePosition,
  onToggleInput,
  onDeleteNode,
  onDeleteWire,
  onAddWire,
  onAddComponentAt,
  onShowToast,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Dragging state for nodes
  const [draggingNodeState, setDraggingNodeState] = useState<{
    nodeId: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Dragging state for wire creation
  const [activeWireDrag, setActiveWireDrag] = useState<DraggingWire | null>(null);
  const [connectingPin, setConnectingPin] = useState<Pin | null>(null);

  // Set of occupied input pin IDs
  const occupiedInputPins = new Set<string>();
  wires.forEach((w) => occupiedInputPins.add(w.toPinId));

  // Get mouse coordinates relative to the canvas container
  const getCanvasRelativeCoords = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;
    return {
      x: clientX - rect.left + scrollLeft,
      y: clientY - rect.top + scrollTop,
    };
  }, []);

  // Handle Drag & Drop from Component Palette
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = (e.dataTransfer.getData('application/reactflow-type') ||
      e.dataTransfer.getData('text/plain')) as LogicType;

    if (!type) return;

    const coords = getCanvasRelativeCoords(e.clientX, e.clientY);
    let x = coords.x - 70;
    let y = coords.y - 40;

    if (snapToGrid) {
      x = Math.round(x / 24) * 24;
      y = Math.round(y / 24) * 24;
    }

    onAddComponentAt(type, Math.max(10, x), Math.max(10, y));
  };

  // Node Dragging Handlers
  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const coords = getCanvasRelativeCoords(e.clientX, e.clientY);
    setDraggingNodeState({
      nodeId,
      offsetX: coords.x - node.x,
      offsetY: coords.y - node.y,
    });

    onSelectNode(nodeId);
    onSelectWire(null);
  };

  // Wire Connection Handlers
  const handlePinMouseDown = (pin: Pin, e: React.MouseEvent) => {
    e.stopPropagation();

    // Only allow starting wires from OUTPUT pins
    if (pin.type === 'input') {
      onShowToast('Sambungan kabel harus dimulai dari pin OUTPUT (kanan) ke pin INPUT (kiri)', 'info');
      return;
    }

    const sourceNode = nodes.find((n) => n.id === pin.nodeId);
    if (!sourceNode) return;

    const pinPos = getPinAbsolutePosition(sourceNode, pin);
    const coords = getCanvasRelativeCoords(e.clientX, e.clientY);

    setConnectingPin(pin);
    setActiveWireDrag({
      fromNodeId: sourceNode.id,
      fromPinId: pin.id,
      fromPinType: pin.type,
      startX: pinPos.x,
      startY: pinPos.y,
      currentX: coords.x,
      currentY: coords.y,
    });
  };

  const handlePinMouseUp = (targetPin: Pin, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!connectingPin || !activeWireDrag) return;

    // VALIDATIONS:
    // 1. Cannot connect pin to another pin on the same node
    if (targetPin.nodeId === connectingPin.nodeId) {
      onShowToast('Tidak dapat menghubungkan pin pada node yang sama', 'error');
      cleanupWireDrag();
      return;
    }

    // 2. Cannot connect same pin types (must be output -> input)
    if (targetPin.type === connectingPin.type) {
      onShowToast('Kabel harus menghubungkan pin OUTPUT ke pin INPUT', 'error');
      cleanupWireDrag();
      return;
    }

    // 3. Ensure target is input pin
    const fromPin = connectingPin.type === 'output' ? connectingPin : targetPin;
    const toPin = connectingPin.type === 'output' ? targetPin : connectingPin;

    // 4. Target input pin can only accept exactly 1 wire
    if (occupiedInputPins.has(toPin.id)) {
      onShowToast('Pin Input ini sudah memiliki kabel yang terhubung', 'error');
      cleanupWireDrag();
      return;
    }

    // 5. Prevent duplicate wire
    const alreadyConnected = wires.some(
      (w) => w.fromPinId === fromPin.id && w.toPinId === toPin.id
    );
    if (alreadyConnected) {
      onShowToast('Koneksi kabel ini sudah ada', 'info');
      cleanupWireDrag();
      return;
    }

    // Successfully create wire!
    const newWire: Wire = {
      id: `wire_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fromNodeId: fromPin.nodeId,
      fromPinId: fromPin.id,
      toNodeId: toPin.nodeId,
      toPinId: toPin.id,
    };

    onAddWire(newWire);
    cleanupWireDrag();
  };

  const cleanupWireDrag = () => {
    setActiveWireDrag(null);
    setConnectingPin(null);
  };

  // Global mousemove & mouseup for smooth dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Handle node movement
      if (draggingNodeState) {
        const coords = getCanvasRelativeCoords(e.clientX, e.clientY);
        let nextX = coords.x - draggingNodeState.offsetX;
        let nextY = coords.y - draggingNodeState.offsetY;

        if (snapToGrid) {
          nextX = Math.round(nextX / 24) * 24;
          nextY = Math.round(nextY / 24) * 24;
        }

        onUpdateNodePosition(
          draggingNodeState.nodeId,
          Math.max(10, nextX),
          Math.max(10, nextY)
        );
      }

      // Handle active wire dragging
      if (activeWireDrag) {
        const coords = getCanvasRelativeCoords(e.clientX, e.clientY);
        setActiveWireDrag((prev) =>
          prev
            ? {
                ...prev,
                currentX: coords.x,
                currentY: coords.y,
              }
            : null
        );
      }
    };

    const handleMouseUp = () => {
      if (draggingNodeState) {
        setDraggingNodeState(null);
      }
      if (activeWireDrag) {
        cleanupWireDrag();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingNodeState, activeWireDrag, getCanvasRelativeCoords, snapToGrid, onUpdateNodePosition]);

  // Keyboard shortcut listener (Delete, Backspace, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input field
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'Escape') {
        if (activeWireDrag) {
          cleanupWireDrag();
          e.preventDefault();
        } else {
          onSelectNode(null);
          onSelectWire(null);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          onDeleteNode(selectedNodeId);
          onSelectNode(null);
          e.preventDefault();
        } else if (selectedWireId) {
          onDeleteWire(selectedWireId);
          onSelectWire(null);
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    activeWireDrag,
    selectedNodeId,
    selectedWireId,
    onDeleteNode,
    onDeleteWire,
    onSelectNode,
    onSelectWire,
  ]);

  return (
    <div
      ref={canvasRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => {
        onSelectNode(null);
        onSelectWire(null);
      }}
      className="relative flex-1 h-full w-full overflow-auto canvas-grid select-none focus:outline-none"
      tabIndex={0}
      aria-label="Simulation Canvas"
    >
      {/* Internal Large Virtual Coordinate Space */}
      <div
        className="relative"
        style={{
          width: '3200px',
          height: '2400px',
          minWidth: '100%',
          minHeight: '100%',
        }}
      >
        {/* Wire Overlay SVG Layer */}
        <WireOverlay
          wires={wires}
          nodes={nodes}
          wireValues={wireValues}
          errorWireIds={errorWireIds}
          selectedWireId={selectedWireId}
          draggingWire={activeWireDrag}
          onSelectWire={(id) => {
            onSelectWire(id);
            onSelectNode(null);
          }}
          onDeleteWire={onDeleteWire}
        />

        {/* Nodes Layer */}
        {nodes.map((node) => {
          return (
            <GateNode
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              pinValues={pinValues}
              outputValue={nodeOutputs[node.id] ?? false}
              isError={errorWireIds.has(node.id)}
              occupiedPins={occupiedInputPins}
              connectingPin={connectingPin}
              onSelectNode={(id) => {
                onSelectNode(id);
                onSelectWire(null);
              }}
              onDeleteNode={onDeleteNode}
              onToggleInput={onToggleInput}
              onNodeMouseDown={handleNodeMouseDown}
              onPinMouseDown={handlePinMouseDown}
              onPinMouseUp={handlePinMouseUp}
            />
          );
        })}

        {/* Empty State Banner */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
            <div className="p-8 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-2xl backdrop-blur-md max-w-md pointer-events-auto">
              <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <PlusCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-1.5">Canvas Sirkuit Kosong</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Tarik komponen dari panel kiri untuk memulai, atau klik tombol di bawah untuk memuat sirkuit contoh.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onAddComponentAt('INPUT', 200, 200)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-650 text-slate-200 text-xs font-medium border border-slate-600 transition-colors"
                >
                  + Tambah Input
                </button>
                <button
                  type="button"
                  onClick={() => onAddComponentAt('AND', 380, 200)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  + Tambah AND Gate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
