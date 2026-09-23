import type { GateNode, Wire, EvaluationResult, LogicType } from '../types/simulator';

/**
 * Computes the logic gate output given its type and input signals.
 * Unconnected inputs default to false (0 / Low).
 */
export function evaluateGate(type: LogicType, inputs: boolean[], inputState: boolean): boolean {
  switch (type) {
    case 'INPUT':
      return inputState;

    case 'OUTPUT':
      return inputs[0] ?? false;

    case 'NOT': {
      const in0 = inputs[0] ?? false;
      return !in0;
    }

    case 'AND': {
      const in0 = inputs[0] ?? false;
      const in1 = inputs[1] ?? false;
      return in0 && in1;
    }

    case 'OR': {
      const in0 = inputs[0] ?? false;
      const in1 = inputs[1] ?? false;
      return in0 || in1;
    }

    case 'XOR': {
      const in0 = inputs[0] ?? false;
      const in1 = inputs[1] ?? false;
      return in0 !== in1;
    }

    case 'NAND': {
      const in0 = inputs[0] ?? false;
      const in1 = inputs[1] ?? false;
      return !(in0 && in1);
    }

    case 'NOR': {
      const in0 = inputs[0] ?? false;
      const in1 = inputs[1] ?? false;
      return !(in0 || in1);
    }

    default:
      return false;
  }
}

/**
 * Evaluates the entire circuit state using topological sorting.
 * Detects cyclic dependencies and returns error wire IDs.
 */
export function evaluateCircuit(nodes: GateNode[], wires: Wire[]): EvaluationResult {
  const nodeMap = new Map<string, GateNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const nodeOutputs: Record<string, boolean> = {};
  const pinValues: Record<string, boolean> = {};
  const wireValues: Record<string, boolean> = {};
  const errorWireIds: string[] = [];

  // Build adjacency list: fromNodeId -> outgoing wires
  // And target input map: toPinId -> Wire
  const outgoingWiresByNode = new Map<string, Wire[]>();
  const incomingWireByPin = new Map<string, Wire>();
  const incomingWiresByNode = new Map<string, Wire[]>();

  for (const wire of wires) {
    if (!outgoingWiresByNode.has(wire.fromNodeId)) {
      outgoingWiresByNode.set(wire.fromNodeId, []);
    }
    outgoingWiresByNode.get(wire.fromNodeId)!.push(wire);

    if (!incomingWiresByNode.has(wire.toNodeId)) {
      incomingWiresByNode.set(wire.toNodeId, []);
    }
    incomingWiresByNode.get(wire.toNodeId)!.push(wire);

    // Save mapping to input pin (enforce 1 wire per input pin)
    incomingWireByPin.set(wire.toPinId, wire);
  }

  // Detect cycles using Tarjan's or DFS cycle detection
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycleEdges = new Set<string>(); // wire IDs in cycles

  function findCyclesDFS(currentNodeId: string, pathWires: Wire[]): void {
    visited.add(currentNodeId);
    recursionStack.add(currentNodeId);

    const outgoing = outgoingWiresByNode.get(currentNodeId) || [];
    for (const wire of outgoing) {
      const nextNodeId = wire.toNodeId;
      if (!visited.has(nextNodeId)) {
        findCyclesDFS(nextNodeId, [...pathWires, wire]);
      } else if (recursionStack.has(nextNodeId)) {
        // Cycle detected!
        cycleEdges.add(wire.id);
        // Also add all wires in the current cycle loop
        const cycleStartIndex = pathWires.findIndex(w => w.fromNodeId === nextNodeId);
        if (cycleStartIndex !== -1) {
          for (let i = cycleStartIndex; i < pathWires.length; i++) {
            cycleEdges.add(pathWires[i].id);
          }
        }
      }
    }

    recursionStack.delete(currentNodeId);
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      findCyclesDFS(node.id, []);
    }
  }

  const hasCycle = cycleEdges.size > 0;
  cycleEdges.forEach(id => errorWireIds.push(id));

  // Compute In-Degree for Topological Sort (Kahn's Algorithm),
  // ignoring edges that are in cycleEdges to avoid being completely stuck.
  const inDegree = new Map<string, number>();
  nodes.forEach(n => inDegree.set(n.id, 0));

  for (const wire of wires) {
    if (!cycleEdges.has(wire.id)) {
      const current = inDegree.get(wire.toNodeId) || 0;
      inDegree.set(wire.toNodeId, current + 1);
    }
  }

  // Queue of nodes with 0 in-degree (e.g. INPUT nodes and unconnected gates)
  const queue: string[] = [];
  for (const [nodeId, degree] of inDegree.entries()) {
    if (degree === 0) {
      queue.push(nodeId);
    }
  }

  // Process nodes in topological order
  const processed = new Set<string>();

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    processed.add(nodeId);
    const node = nodeMap.get(nodeId);
    if (!node) continue;

    // Resolve inputs for this node
    const inputSignals: boolean[] = [];
    if (node.inputs && node.inputs.length > 0) {
      for (const inputPin of node.inputs) {
        const wire = incomingWireByPin.get(inputPin.id);
        let val = false;
        if (wire && !cycleEdges.has(wire.id)) {
          // Wire takes value from source pin / source node output
          val = pinValues[wire.fromPinId] ?? nodeOutputs[wire.fromNodeId] ?? false;
        }
        inputSignals[inputPin.index] = val;
        pinValues[inputPin.id] = val;
      }
    }

    // Evaluate node output
    const outputSignal = evaluateGate(node.type, inputSignals, node.state);
    nodeOutputs[node.id] = outputSignal;

    // Assign to node's output pins
    if (node.outputs && node.outputs.length > 0) {
      for (const outputPin of node.outputs) {
        pinValues[outputPin.id] = outputSignal;
      }
    }

    // Traverse outgoing wires
    const outgoing = outgoingWiresByNode.get(nodeId) || [];
    for (const wire of outgoing) {
      if (cycleEdges.has(wire.id)) {
        wireValues[wire.id] = false;
        continue;
      }
      wireValues[wire.id] = outputSignal;

      const nextDegree = (inDegree.get(wire.toNodeId) || 1) - 1;
      inDegree.set(wire.toNodeId, nextDegree);
      if (nextDegree === 0) {
        queue.push(wire.toNodeId);
      }
    }
  }

  // Any nodes that were not processed (part of cycle) get default false
  for (const node of nodes) {
    if (!processed.has(node.id)) {
      nodeOutputs[node.id] = false;
      if (node.inputs) {
        node.inputs.forEach(p => {
          pinValues[p.id] = false;
        });
      }
      if (node.outputs) {
        node.outputs.forEach(p => {
          pinValues[p.id] = false;
        });
      }
    }
  }

  // Final pass for wire values
  for (const wire of wires) {
    if (cycleEdges.has(wire.id)) {
      wireValues[wire.id] = false;
    } else if (wireValues[wire.id] === undefined) {
      wireValues[wire.id] = pinValues[wire.fromPinId] ?? false;
    }
  }

  return {
    nodeOutputs,
    pinValues,
    wireValues,
    errorWireIds,
    hasCycle,
  };
}
