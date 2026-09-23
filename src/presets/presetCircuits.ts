import type { CircuitState, GateNode, LogicType, Pin } from '../types/simulator';

export function createPinsForType(nodeId: string, type: LogicType): { inputs: Pin[]; outputs: Pin[] } {
  const inputs: Pin[] = [];
  const outputs: Pin[] = [];

  if (type === 'INPUT') {
    outputs.push({
      id: `${nodeId}-out-0`,
      nodeId,
      type: 'output',
      index: 0,
      label: 'OUT',
    });
  } else if (type === 'OUTPUT') {
    inputs.push({
      id: `${nodeId}-in-0`,
      nodeId,
      type: 'input',
      index: 0,
      label: 'IN',
    });
  } else if (type === 'NOT') {
    inputs.push({
      id: `${nodeId}-in-0`,
      nodeId,
      type: 'input',
      index: 0,
      label: 'IN',
    });
    outputs.push({
      id: `${nodeId}-out-0`,
      nodeId,
      type: 'output',
      index: 0,
      label: 'OUT',
    });
  } else {
    // 2-input gates: AND, OR, XOR, NAND, NOR
    inputs.push({
      id: `${nodeId}-in-0`,
      nodeId,
      type: 'input',
      index: 0,
      label: 'A',
    });
    inputs.push({
      id: `${nodeId}-in-1`,
      nodeId,
      type: 'input',
      index: 1,
      label: 'B',
    });
    outputs.push({
      id: `${nodeId}-out-0`,
      nodeId,
      type: 'output',
      index: 0,
      label: 'OUT',
    });
  }

  return { inputs, outputs };
}

export function createNode(type: LogicType, x: number, y: number, label?: string, id?: string): GateNode {
  const nodeId = id || `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const { inputs, outputs } = createPinsForType(nodeId, type);

  return {
    id: nodeId,
    type,
    x,
    y,
    label: label || type,
    state: false,
    inputs,
    outputs,
  };
}

export interface PresetCircuit {
  id: string;
  name: string;
  description: string;
  circuit: CircuitState;
}

export const PRESET_CIRCUITS: PresetCircuit[] = [
  {
    id: 'half-adder',
    name: 'Half Adder',
    description: 'Menjumlahkan 2 bit input tunggal menghasilkan Sum (XOR) dan Carry (AND).',
    circuit: {
      nodes: [
        {
          id: 'ha_in_a',
          type: 'INPUT',
          x: 100,
          y: 120,
          label: 'Input A',
          state: false,
          ...createPinsForType('ha_in_a', 'INPUT'),
        },
        {
          id: 'ha_in_b',
          type: 'INPUT',
          x: 100,
          y: 280,
          label: 'Input B',
          state: false,
          ...createPinsForType('ha_in_b', 'INPUT'),
        },
        {
          id: 'ha_xor',
          type: 'XOR',
          x: 360,
          y: 130,
          label: 'XOR (Sum)',
          state: false,
          ...createPinsForType('ha_xor', 'XOR'),
        },
        {
          id: 'ha_and',
          type: 'AND',
          x: 360,
          y: 270,
          label: 'AND (Carry)',
          state: false,
          ...createPinsForType('ha_and', 'AND'),
        },
        {
          id: 'ha_out_sum',
          type: 'OUTPUT',
          x: 600,
          y: 130,
          label: 'Sum (S)',
          state: false,
          ...createPinsForType('ha_out_sum', 'OUTPUT'),
        },
        {
          id: 'ha_out_carry',
          type: 'OUTPUT',
          x: 600,
          y: 270,
          label: 'Carry (C)',
          state: false,
          ...createPinsForType('ha_out_carry', 'OUTPUT'),
        },
      ],
      wires: [
        {
          id: 'ha_w1',
          fromNodeId: 'ha_in_a',
          fromPinId: 'ha_in_a-out-0',
          toNodeId: 'ha_xor',
          toPinId: 'ha_xor-in-0',
        },
        {
          id: 'ha_w2',
          fromNodeId: 'ha_in_b',
          fromPinId: 'ha_in_b-out-0',
          toNodeId: 'ha_xor',
          toPinId: 'ha_xor-in-1',
        },
        {
          id: 'ha_w3',
          fromNodeId: 'ha_in_a',
          fromPinId: 'ha_in_a-out-0',
          toNodeId: 'ha_and',
          toPinId: 'ha_and-in-0',
        },
        {
          id: 'ha_w4',
          fromNodeId: 'ha_in_b',
          fromPinId: 'ha_in_b-out-0',
          toNodeId: 'ha_and',
          toPinId: 'ha_and-in-1',
        },
        {
          id: 'ha_w5',
          fromNodeId: 'ha_xor',
          fromPinId: 'ha_xor-out-0',
          toNodeId: 'ha_out_sum',
          toPinId: 'ha_out_sum-in-0',
        },
        {
          id: 'ha_w6',
          fromNodeId: 'ha_and',
          fromPinId: 'ha_and-out-0',
          toNodeId: 'ha_out_carry',
          toPinId: 'ha_out_carry-in-0',
        },
      ],
    },
  },
  {
    id: 'mux-2-1',
    name: 'Multiplexer (MUX 2:1)',
    description: 'Memilih satu dari 2 sinyal data (D0 atau D1) berdasarkan sinyal kontrol Select (S).',
    circuit: {
      nodes: [
        {
          id: 'mux_d0',
          type: 'INPUT',
          x: 80,
          y: 80,
          label: 'Data 0 (D0)',
          state: true,
          ...createPinsForType('mux_d0', 'INPUT'),
        },
        {
          id: 'mux_d1',
          type: 'INPUT',
          x: 80,
          y: 220,
          label: 'Data 1 (D1)',
          state: false,
          ...createPinsForType('mux_d1', 'INPUT'),
        },
        {
          id: 'mux_sel',
          type: 'INPUT',
          x: 80,
          y: 360,
          label: 'Select (S)',
          state: false,
          ...createPinsForType('mux_sel', 'INPUT'),
        },
        {
          id: 'mux_not',
          type: 'NOT',
          x: 280,
          y: 400,
          label: 'NOT S',
          state: false,
          ...createPinsForType('mux_not', 'NOT'),
        },
        {
          id: 'mux_and0',
          type: 'AND',
          x: 440,
          y: 110,
          label: 'AND (D0 · ~S)',
          state: false,
          ...createPinsForType('mux_and0', 'AND'),
        },
        {
          id: 'mux_and1',
          type: 'AND',
          x: 440,
          y: 270,
          label: 'AND (D1 · S)',
          state: false,
          ...createPinsForType('mux_and1', 'AND'),
        },
        {
          id: 'mux_or',
          type: 'OR',
          x: 640,
          y: 190,
          label: 'OR',
          state: false,
          ...createPinsForType('mux_or', 'OR'),
        },
        {
          id: 'mux_out',
          type: 'OUTPUT',
          x: 820,
          y: 190,
          label: 'Output (Y)',
          state: false,
          ...createPinsForType('mux_out', 'OUTPUT'),
        },
      ],
      wires: [
        {
          id: 'mux_w_d0_and0',
          fromNodeId: 'mux_d0',
          fromPinId: 'mux_d0-out-0',
          toNodeId: 'mux_and0',
          toPinId: 'mux_and0-in-0',
        },
        {
          id: 'mux_w_sel_not',
          fromNodeId: 'mux_sel',
          fromPinId: 'mux_sel-out-0',
          toNodeId: 'mux_not',
          toPinId: 'mux_not-in-0',
        },
        {
          id: 'mux_w_not_and0',
          fromNodeId: 'mux_not',
          fromPinId: 'mux_not-out-0',
          toNodeId: 'mux_and0',
          toPinId: 'mux_and0-in-1',
        },
        {
          id: 'mux_w_d1_and1',
          fromNodeId: 'mux_d1',
          fromPinId: 'mux_d1-out-0',
          toNodeId: 'mux_and1',
          toPinId: 'mux_and1-in-0',
        },
        {
          id: 'mux_w_sel_and1',
          fromNodeId: 'mux_sel',
          fromPinId: 'mux_sel-out-0',
          toNodeId: 'mux_and1',
          toPinId: 'mux_and1-in-1',
        },
        {
          id: 'mux_w_and0_or',
          fromNodeId: 'mux_and0',
          fromPinId: 'mux_and0-out-0',
          toNodeId: 'mux_or',
          toPinId: 'mux_or-in-0',
        },
        {
          id: 'mux_w_and1_or',
          fromNodeId: 'mux_and1',
          fromPinId: 'mux_and1-out-0',
          toNodeId: 'mux_or',
          toPinId: 'mux_or-in-1',
        },
        {
          id: 'mux_w_or_out',
          fromNodeId: 'mux_or',
          fromPinId: 'mux_or-out-0',
          toNodeId: 'mux_out',
          toPinId: 'mux_out-in-0',
        },
      ],
    },
  },
];
