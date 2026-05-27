import { evaluate } from 'mathjs';

export function calculateCustom(expression: string, values: Record<string, number>) {
  try {
    const result = evaluate(expression, values);
    return { result };
  } catch (error) {
    return { error: '式の評価に失敗しました。' };
  }
}
