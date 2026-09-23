import React from 'react';
import type { GateNode as GateNodeType, Pin } from '../types/simulator';
import { NodePin } from './NodePin';
import { getNodeDimensions, getPinRelativePosition } from '../utils/coordinateUtils';
import { Trash2, ToggleLeft, ToggleRight, Radio, Lightbulb } from 'lucide-react';

interface GateNodeProps {
  node: GateNodeType;
  isSelected: boolean;
  pinValues: Record<string, boolean>;
  outputValue: boolean;
  isError?: boolean;
  occupiedPins: Set<string>;
  connectingPin: Pin | null;
  onSelectNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onToggleInput: (nodeId: string) => void;
  onNodeMouseDown: (nodeId: string, e: React.MouseEvent) => void;
  onPinMouseDown: (pin: Pin, e: React.MouseEvent) => void;
  onPinMouseUp: (pin: Pin, e: React.MouseEvent) => void;
}

// Logic gate symbol mini schematics
const GateSymbol: React.FC<{ type: string; active: boolean }> = ({ type, active }) => {
  const strokeColor = active ? '#10b981' : '#64748b';
  const fillColor = active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(51, 65, 85, 0.15)';

  switch (type) {
    case 'AND':
      return (
        <svg width="42" height="28" viewBox="0 0 42 28" fill="none" className="transition-colors">
          <path
            d="M 6 4 L 20 4 C 28 4 34 8 34 14 C 34 20 28 24 20 24 L 6 24 Z"
            stroke={strokeColor}
            strokeWidth="2"
            fill={fillColor}
          />
        </svg>
      );
    case 'NAND':
      return (
        <svg width="46" height="28" viewBox="0 0 46 28" fill="none" className="transition-colors">
          <path
            d="M 6 4 L 18 4 C 26 4 32 8 32 14 C 32 20 26 24 18 24 L 6 24 Z"
            stroke={strokeColor}
            strokeWidth="2"
            fill={fillColor}
          />
          <circle cx="36" cy="14" r="3" stroke={strokeColor} strokeWidth="1.5" fill="none" />
        </svg>
      );
    case 'OR':
      return (
        <svg width="42" height="28" viewBox="0 0 42 28" fill="none" className="transition-colors">
          <path
            d="M 6 4 C 12 10 12 18 6 24 C 18 24 26 20 36 14 C 26 8 18 4 6 4 Z"
            stroke={strokeColor}
            strokeWidth="2"
            fill={fillColor}
          />
        </svg>
      );
    case 'NOR':
      return (
        <svg width="46" height="28" viewBox="0 0 46 28" fill="none" className="transition-colors">
          <path
            d="M 6 4 C 12 10 12 18 6 24 C 18 24 26 20 34 14 C 26 8 18 4 6 4 Z"
            stroke={strokeColor}
            strokeWidth="2"
            fill={fillColor}
          />
          <circle cx="38" cy="14" r="3" stroke={strokeColor} strokeWidth="1.5" fill="none" />
        </svg>
      );
    case 'XOR':
      return (
        <svg width="44" height="28" viewBox="0 0 44 28" fill="none" className="transition-colors">
          <path d="M 4 4 C 10 10 10 18 4 24" stroke={strokeColor} strokeWidth="2" />
          <path
            d="M 8 4 C 14 10 14 18 8 24 C 20 24 28 20 38 14 C 28 8 20 4 8 4 Z"
            stroke={strokeColor}
            strokeWidth="2"
            fill={fillColor}
          />
        </svg>
      );
    case 'NOT':
      return (
        <svg width="42" height="28" viewBox="0 0 42 28" fill="none" className="transition-colors">
          <polygon points="6,4 30,14 6,24" stroke={strokeColor} strokeWidth="2" fill={fillColor} />
          <circle cx="34" cy="14" r="3" stroke={strokeColor} strokeWidth="1.5" fill="none" />
        </svg>
      );
    default:
      return null;
  }
};

export const GateNode: React.FC<GateNodeProps> = ({
  node,
  isSelected,
  pinValues,
  outputValue,
  isError = false,
  occupiedPins,
  connectingPin,
  onSelectNode,
  onDeleteNode,
  onToggleInput,
  onNodeMouseDown,
  onPinMouseDown,
  onPinMouseUp,
}) => {
  const dims = getNodeDimensions(node.type);

  // Border & Glow styling
  let containerBorder = 'border-slate-700 bg-slate-800/95';
  if (isSelected) {
    containerBorder = 'border-sky-500 ring-2 ring-sky-500/40 bg-slate-800';
  } else if (isError) {
    containerBorder = 'border-rose-500 ring-2 ring-rose-500/30 bg-slate-800';
  } else if (outputValue) {
    containerBorder = 'border-emerald-600/70 bg-slate-800';
  }

  return (
    <div
      style={{
        transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
        width: dims.width,
        height: dims.height,
      }}
      className={`absolute z-10 rounded-lg border shadow-lg transition-[border-color,box-shadow] duration-150 cursor-grab active:cursor-grabbing select-none backdrop-blur-sm ${containerBorder}`}
      onMouseDown={(e) => onNodeMouseDown(node.id, e)}
      onClick={(e) => {
        e.stopPropagation();
        onSelectNode(node.id);
      }}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between px-2.5 py-1 border-b border-slate-700/60 bg-slate-900/40 rounded-t-lg">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`w-2 h-2 rounded-full ${
              isError
                ? 'bg-rose-500 animate-pulse'
                : outputValue
                ? 'bg-emerald-400'
                : 'bg-slate-500'
            }`}
          />
          <span className="text-xs font-semibold tracking-wide text-slate-200 truncate">
            {node.label}
          </span>
        </div>

        <button
          type="button"
          aria-label={`Hapus node ${node.label}`}
          title="Hapus Node (Delete)"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteNode(node.id);
          }}
          className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition-colors opacity-70 hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Node Body Content */}
      <div className="relative flex items-center justify-center h-[calc(100%-25px)] px-2">
        {/* INPUT SWITCH NODE */}
        {node.type === 'INPUT' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleInput(node.id);
            }}
            aria-label={`Toggle input: ${node.state ? 'High (1)' : 'Low (0)'}`}
            className={`w-full flex items-center justify-between px-2 py-1.5 rounded border transition-colors ${
              node.state
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-1 text-xs font-medium">
              <Radio className={`w-3.5 h-3.5 ${node.state ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              <span>{node.state ? 'HIGH' : 'LOW'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono text-sm font-bold">{node.state ? '1' : '0'}</span>
              {node.state ? (
                <ToggleRight className="w-5 h-5 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-slate-500" />
              )}
            </div>
          </button>
        )}

        {/* OUTPUT LED NODE */}
        {node.type === 'OUTPUT' && (
          <div
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border transition-colors ${
              outputValue
                ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Lightbulb
                className={`w-4 h-4 transition-colors ${
                  outputValue ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'text-slate-600'
                }`}
              />
              <span>{outputValue ? 'ACTIVE' : 'OFF'}</span>
            </div>
            <span
              className={`font-mono text-sm font-bold px-1.5 py-0.5 rounded border ${
                outputValue
                  ? 'bg-emerald-900/60 border-emerald-500/80 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              {outputValue ? '1' : '0'}
            </span>
          </div>
        )}

        {/* LOGIC GATES (AND, OR, NOT, XOR, NAND, NOR) */}
        {node.type !== 'INPUT' && node.type !== 'OUTPUT' && (
          <div className="flex items-center justify-center gap-2">
            <GateSymbol type={node.type} active={outputValue} />
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-slate-400 font-semibold">{node.type}</span>
              <span
                className={`text-xs font-mono font-bold ${
                  isError ? 'text-rose-400' : outputValue ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {outputValue ? '1' : '0'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* RENDER INPUT PINS (LEFT SIDE) */}
      {node.inputs?.map((pin) => {
        const pinPos = getPinRelativePosition(node.type, 'input', pin.index);
        const pinVal = pinValues[pin.id] ?? false;
        const isOccupied = occupiedPins.has(pin.id);
        const isValidDropTarget = connectingPin ? connectingPin.type === 'output' && !isOccupied : true;

        return (
          <div
            key={pin.id}
            style={{
              top: `${pinPos.y}px`,
            }}
            className="absolute left-0"
          >
            <NodePin
              pin={pin}
              value={pinVal}
              isError={isError}
              isOccupied={isOccupied}
              isConnecting={Boolean(connectingPin)}
              isValidDropTarget={isValidDropTarget}
              onPinMouseDown={onPinMouseDown}
              onPinMouseUp={onPinMouseUp}
            />
          </div>
        );
      })}

      {/* RENDER OUTPUT PINS (RIGHT SIDE) */}
      {node.outputs?.map((pin) => {
        const pinPos = getPinRelativePosition(node.type, 'output', pin.index);
        const pinVal = pinValues[pin.id] ?? outputValue;

        return (
          <div
            key={pin.id}
            style={{
              top: `${pinPos.y}px`,
            }}
            className="absolute right-0"
          >
            <NodePin
              pin={pin}
              value={pinVal}
              isError={isError}
              isOccupied={false}
              isConnecting={Boolean(connectingPin)}
              isValidDropTarget={false}
              onPinMouseDown={onPinMouseDown}
              onPinMouseUp={onPinMouseUp}
            />
          </div>
        );
      })}
    </div>
  );
};
