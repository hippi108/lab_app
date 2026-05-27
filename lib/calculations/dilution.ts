import { evaluate } from 'mathjs';
import type { DilutionInputs } from '@/types/calculation';

export function calculateDilution(inputs: DilutionInputs) {
  try {
    if (inputs.c1 != null && inputs.c2 != null && inputs.v2 != null) {
      const v1 = evaluate('c2 * v2 / c1', inputs);
      return { result: { v1 }, mode: 'v1' as const };
    }
    if (inputs.c1 != null && inputs.v1 != null && inputs.v2 != null) {
      const c2 = evaluate('c1 * v1 / v2', inputs);
      return { result: { c2 }, mode: 'c2' as const };
    }
    if (inputs.c1 != null && inputs.v1 != null && inputs.c2 != null) {
      const v2 = evaluate('c1 * v1 / c2', inputs);
      return { result: { v2 }, mode: 'v2' as const };
    }
    return { error: '3 つの値を入力してください。' };
  } catch (error) {
    return { error: '入力値を確認してください。' };
  }
}
