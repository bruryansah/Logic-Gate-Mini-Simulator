import type { GateNode, Pin } from '../types/simulator';

export interface NodeDimensions {
  width: number;
  height: number;
}

export function getNodeDimensions(type: string): NodeDimensions {
  switch (type) {
    case 'INPUT':
      return { width: 130, height: 72 };
    case 'OUTPUT':
      return { width: 130, height: 72 };
    case 'NOT':
      return { width: 140, height: 80 };
    default:
      // AND, OR, XOR, NAND, NOR (2 inputs)
      return { width: 140, height: 96 };
  }
}

export function getPinRelativePosition(nodeType: string, pinType: 'input' | 'output', pinIndex: number): { x: number; y: number } {
  const dims = getNodeDimensions(nodeType);

  if (nodeType === 'INPUT') {
    return { x: dims.width, y: dims.height / 2 };
  }

  if (nodeType === 'OUTPUT') {
    return { x: 0, y: dims.height / 2 };
  }

  if (nodeType === 'NOT') {
    if (pinType === 'input') {
      return { x: 0, y: dims.height / 2 };
    }
    return { x: dims.width, y: dims.height / 2 };
  }

  // 2-input logic gates
  if (pinType === 'input') {
    const y = pinIndex === 0 ? 32 : 64;
    return { x: 0, y };
  } else {
    return { x: dims.width, y: 48 };
  }
}

export function getPinAbsolutePosition(node: GateNode, pin: Pin): { x: number; y: number } {
  const rel = getPinRelativePosition(node.type, pin.type, pin.index);
  return {
    x: node.x + rel.x,
    y: node.y + rel.y,
  };
}
