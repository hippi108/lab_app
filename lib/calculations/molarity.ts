import { evaluate } from 'mathjs';
import type { MolarityInputs } from '@/types/calculation';

export function calculateMolarity(inputs: MolarityInputs) {
  try {
    const moles = evaluate('mass / molecular_weight', inputs);
    const volume_L = evaluate('volume_ml / 1000', inputs);
    const molarity = evaluate('moles / volume_L', { ...inputs, moles, volume_L });
    return { moles, molarity };
  } catch (error) {
    return { error: '正しい入力値を使用してください。' };
  }
}
