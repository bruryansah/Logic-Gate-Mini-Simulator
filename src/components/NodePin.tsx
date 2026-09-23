import React from 'react';
import type { Pin } from '../types/simulator';

interface NodePinProps {
  pin: Pin;
  value: boolean;
  isError?: boolean;
  isOccupied?: boolean;
  isConnecting?: boolean;
  isValidDropTarget?: boolean;
  onPinMouseDown: (pin: Pin, e: React.MouseEvent) => void;
  onPinMouseUp: (pin: Pin, e: React.MouseEvent) => void;
}

export const NodePin: React.FC<NodePinProps> = ({
  pin,
  value,
  isError = false,
  isOccupied = false,
  isConnecting = false,
  isValidDropTarget = true,
  onPinMouseDown,
  onPinMouseUp,
}) => {
  const isInput = pin.type === 'input';

  // Style classes based on signal state
  let pinColorClass = 'bg-slate-800 border-slate-600 text-slate-400';
  let badgeColorClass = 'bg-slate-800/80 text-slate-400 border-slate-700';

  if (isError) {
    pinColorClass = 'bg-rose-950 border-rose-500 text-rose-400 ring-2 ring-rose-500/40';
    badgeColorClass = 'bg-rose-900/60 text-rose-300 border-rose-600';
  } else if (value) {
    pinColorClass = 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40';
    badgeColorClass = 'bg-emerald-950 text-emerald-400 border-emerald-600';
  }

  // Hover and targeting cues
  let ringClasses = '';
  if (isConnecting) {
    if (isValidDropTarget) {
      ringClasses = 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 scale-125';
    } else {
      ringClasses = 'opacity-40 cursor-not-allowed';
    }
  }

  return (
    <div
      className={`absolute flex items-center gap-1.5 select-none ${
        isInput ? '-left-2.5 flex-row-reverse' : '-right-2.5 flex-row'
      }`}
      style={{
        transform: 'translateY(-50%)',
      }}
    >
      {/* Pin Label & 0/1 signal indicator */}
      <div
        className={`flex items-center gap-1 px-1 py-0.5 rounded text-[10px] font-mono border transition-colors ${badgeColorClass}`}
      >
        <span className="font-semibold text-slate-300">{pin.label || (isInput ? 'IN' : 'OUT')}</span>
        <span className={`font-bold ${value ? 'text-emerald-400' : 'text-slate-500'}`}>
          {value ? '1' : '0'}
        </span>
      </div>

      {/* Interactive Pin Port */}
      <button
        type="button"
        data-pin-id={pin.id}
        aria-label={`Pin ${pin.label || pin.id}, Type ${pin.type}, Value ${value ? '1 (High)' : '0 (Low)'}${
          isOccupied ? ', Connected' : ''
        }`}
        title={`${pin.label || pin.type.toUpperCase()}: ${value ? '1 (High)' : '0 (Low)'}${
          isOccupied && isInput ? ' (Occupied)' : ''
        }`}
        onMouseDown={(e) => {
          e.stopPropagation();
          onPinMouseDown(pin, e);
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          onPinMouseUp(pin, e);
        }}
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-crosshair transition-all duration-150 hover:scale-125 ${pinColorClass} ${ringClasses} ${
          isOccupied && isInput ? 'ring-1 ring-slate-500' : ''
        }`}
      >
        {/* Inner center dot */}
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isError ? 'bg-rose-400' : value ? 'bg-emerald-400' : 'bg-slate-500'
          }`}
        />
      </button>
    </div>
  );
};
