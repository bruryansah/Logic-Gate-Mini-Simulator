import type { GateNode, Wire, TruthTableData, TruthTableRow } from '../types/simulator';
import { evaluateCircuit } from './logicEvaluator';

/**
 * Dynamically computes the Truth Table for all INPUT and OUTPUT nodes present on the canvas.
 * Supports up to 8 inputs (2^8 = 256 rows) to ensure high performance and UI responsiveness.
 */
export function generateTruthTable(nodes: GateNode[], wires: Wire[]): TruthTableData {
  // Extract and sort input nodes deterministically (by Y position, then X position, or label)
  const inputNodes = nodes
    .filter(n => n.type === 'INPUT')
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .map(n => ({ id: n.id, label: n.label || `IN-${n.id.slice(-4)}` }));

  // Extract output nodes
  const outputNodes = nodes
    .filter(n => n.type === 'OUTPUT')
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .map(n => ({ id: n.id, label: n.label || `OUT-${n.id.slice(-4)}` }));

  const n = inputNodes.length;

  if (n === 0 || outputNodes.length === 0) {
    return {
      inputNodes,
      outputNodes,
      rows: [],
      isExceeded: false,
    };
  }

  // Safety limit: if > 8 inputs, cap to 8 to avoid 2^9+ rendering issues
  const maxInputs = 8;
  const isExceeded = n > maxInputs;
  const effectiveN = Math.min(n, maxInputs);
  const totalCombinations = 1 << effectiveN; // 2^effectiveN

  const rows: TruthTableRow[] = [];

  for (let i = 0; i < totalCombinations; i++) {
    const inputValues: Record<string, boolean> = {};

    // Generate binary representation for each input (MSB to LSB)
    for (let bit = 0; bit < effectiveN; bit++) {
      // Bit shift: highest index input is least significant bit
      const isHigh = Boolean((i >> (effectiveN - 1 - bit)) & 1);
      inputValues[inputNodes[bit].id] = isHigh;
    }

    // Clone nodes with this combination's input states
    const testNodes: GateNode[] = nodes.map(node => {
      if (node.type === 'INPUT') {
        const val = inputValues[node.id] ?? false;
        return {
          ...node,
          state: val,
        };
      }
      return { ...node };
    });

    // Evaluate circuit
    const evaluation = evaluateCircuit(testNodes, wires);

    // Record output values
    const outputValues: Record<string, boolean> = {};
    for (const outNode of outputNodes) {
      outputValues[outNode.id] = evaluation.nodeOutputs[outNode.id] ?? false;
    }

    rows.push({
      inputs: inputValues,
      outputs: outputValues,
    });
  }

  return {
    inputNodes,
    outputNodes,
    rows,
    isExceeded,
  };
}
