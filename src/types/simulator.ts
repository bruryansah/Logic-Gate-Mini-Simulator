export type LogicType = 'INPUT' | 'OUTPUT' | 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR';

export type PinType = 'input' | 'output';

export interface Pin {
  id: string;
  nodeId: string;
  type: PinType;
  index: number;
  label?: string;
}

export interface GateNode {
  id: string;
  type: LogicType;
  x: number;
  y: number;
  label: string;
  state: boolean; // For INPUT: user toggled signal; for others: current output
  inputs: Pin[];
  outputs: Pin[];
}

export interface Wire {
  id: string;
  fromNodeId: string;
  fromPinId: string;
  toNodeId: string;
  toPinId: string;
  isError?: boolean;
}

export interface CircuitState {
  nodes: GateNode[];
  wires: Wire[];
}

export interface EvaluationResult {
  nodeOutputs: Record<string, boolean>; // nodeId -> boolean
  pinValues: Record<string, boolean>;    // pinId -> boolean
  wireValues: Record<string, boolean>;   // wireId -> boolean
  errorWireIds: string[];                // wires involved in cyclic dependency
  hasCycle: boolean;
}

export interface TruthTableRow {
  inputs: Record<string, boolean>; // inputNodeId -> boolean
  outputs: Record<string, boolean>; // outputNodeId -> boolean
}

export interface TruthTableData {
  inputNodes: { id: string; label: string }[];
  outputNodes: { id: string; label: string }[];
  rows: TruthTableRow[];
  isExceeded?: boolean; // if > 8 inputs (2^8 = 256 rows max to avoid freezing)
}

export interface DraggingWire {
  fromNodeId: string;
  fromPinId: string;
  fromPinType: PinType;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
