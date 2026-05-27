import { evaluate } from 'mathjs';
import type { CalculationBlock } from '@/types/protocol';

export function evaluateCalculationBlock(block: CalculationBlock, inputValues: Record<string, number>) {
  const ctx: Record<string, number> = { ...inputValues };
  // include constants if present
  if ('constants' in block && Array.isArray(block.constants)) {
    block.constants.forEach((c) => {
      ctx[c.key] = Number(c.value);
    });
  }

  const outputs: Record<string, number | string> = {};
  try {
    block.formulas.forEach((f) => {
      const value = evaluate(f.expression, ctx);
      // store numeric if possible
      outputs[f.key] = typeof value === 'number' ? value : String(value);
      // also expose to context so formulas can depend on each other
      if (typeof value === 'number') ctx[f.key] = value;
    });
    return { outputs };
  } catch (error) {
    return { error: '計算式の評価に失敗しました。' };
  }
}
