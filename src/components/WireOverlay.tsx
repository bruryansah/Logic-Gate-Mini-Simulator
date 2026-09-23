import React from 'react';
import type { GateNode, Wire, DraggingWire } from '../types/simulator';
import { getPinAbsolutePosition } from '../utils/coordinateUtils';

interface WireOverlayProps {
  wires: Wire[];
  nodes: GateNode[];
  wireValues: Record<string, boolean>;
  errorWireIds: Set<string>;
  selectedWireId: string | null;
  draggingWire: DraggingWire | null;
  onSelectWire: (wireId: string) => void;
  onDeleteWire: (wireId: string) => void;
}

export const WireOverlay: React.FC<WireOverlayProps> = ({
  wires,
  nodes,
  wireValues,
  errorWireIds,
  selectedWireId,
  draggingWire,
  onSelectWire,
  onDeleteWire,
}) => {
  const nodeMap = new Map<string, GateNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  // Generates smooth cubic Bezier path
  const createBezierPath = (startX: number, startY: number, endX: number, endY: number): string => {
    const dx = Math.abs(endX - startX);
    // Base control offset
    const curvature = Math.max(40, dx * 0.5);

    // If end is behind start, add more curvature to loop around cleanly
    const isBackwards = endX < startX;
    const cp1x = startX + (isBackwards ? curvature * 1.2 : curvature);
    const cp1y = startY;
    const cp2x = endX - (isBackwards ? curvature * 1.2 : curvature);
    const cp2y = endY;

    return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
  };

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
      style={{ minWidth: '100%', minHeight: '100%' }}
    >
      <defs>
        {/* Signal direction markers */}
        <marker
          id="arrow-emerald"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 8 5 L 0 9 z" fill="#10b981" />
        </marker>
        <marker
          id="arrow-slate"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748b" />
        </marker>
        <marker
          id="arrow-rose"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 8 5 L 0 9 z" fill="#f43f5e" />
        </marker>
      </defs>

      {/* Render established wires */}
      {wires.map((wire) => {
        const fromNode = nodeMap.get(wire.fromNodeId);
        const toNode = nodeMap.get(wire.toNodeId);

        if (!fromNode || !toNode) return null;

        const fromPin = fromNode.outputs?.find((p) => p.id === wire.fromPinId);
        const toPin = toNode.inputs?.find((p) => p.id === wire.toPinId);

        if (!fromPin || !toPin) return null;

        const startPos = getPinAbsolutePosition(fromNode, fromPin);
        const endPos = getPinAbsolutePosition(toNode, toPin);

        const pathData = createBezierPath(startPos.x, startPos.y, endPos.x, endPos.y);
        const isError = errorWireIds.has(wire.id) || Boolean(wire.isError);
        const isActive = wireValues[wire.id] ?? false;
        const isSelected = selectedWireId === wire.id;

        let strokeColor = isActive ? '#10b981' : '#64748b';
        let strokeWidth = isActive ? 2.5 : 2;
        let strokeDash = 'none';

        if (isError) {
          strokeColor = '#f43f5e';
          strokeWidth = 3;
          strokeDash = '6, 4';
        } else if (isSelected) {
          strokeColor = '#38bdf8';
          strokeWidth = 3.5;
        }

        return (
          <g key={wire.id} className="cursor-pointer group pointer-events-auto">
            {/* Invisible thick stroke for easy hover & click selection */}
            <path
              d={pathData}
              fill="none"
              stroke="transparent"
              strokeWidth="16"
              onClick={(e) => {
                e.stopPropagation();
                onSelectWire(wire.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onDeleteWire(wire.id);
              }}
              aria-label={`Wire from ${fromNode.label} to ${toNode.label}`}
            />

            {/* Main visible wire path */}
            <path
              d={pathData}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDash}
              strokeLinecap="round"
              className="transition-colors duration-150 group-hover:stroke-sky-400"
            />

            {/* Midpoint signal indicator badge if wire is selected */}
            {isSelected && (
              <circle
                cx={(startPos.x + endPos.x) / 2}
                cy={(startPos.y + endPos.y) / 2}
                r="6"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="2"
              />
            )}
          </g>
        );
      })}

      {/* Render active dragging wire */}
      {draggingWire && (
        <path
          d={createBezierPath(
            draggingWire.startX,
            draggingWire.startY,
            draggingWire.currentX,
            draggingWire.currentY
          )}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeDasharray="4, 4"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
};
