import { evaluate } from 'mathjs';
import type { PCRInputs } from '@/types/calculation';

export function calculatePcr(inputs: PCRInputs) {
  const safe = {
    sample_count: inputs.sample_count,
    reaction_volume: inputs.reaction_volume,
    excess_rate: inputs.excess_rate,
    buffer_ratio: inputs.buffer_ratio,
    dntp_volume_per_reaction: inputs.dntp_volume_per_reaction,
    primer_f_volume_per_reaction: inputs.primer_f_volume_per_reaction,
    primer_r_volume_per_reaction: inputs.primer_r_volume_per_reaction,
    polymerase_volume_per_reaction: inputs.polymerase_volume_per_reaction,
    template_volume_per_reaction: inputs.template_volume_per_reaction,
  };

  const total_volume = evaluate('sample_count * reaction_volume * excess_rate', safe);
  const buffer_volume = evaluate('sample_count * buffer_ratio * 2', safe);
  const dntp_volume = evaluate('dntp_volume_per_reaction * sample_count * excess_rate', safe);
  const primer_f_volume = evaluate('primer_f_volume_per_reaction * sample_count * excess_rate', safe);
  const primer_r_volume = evaluate('primer_r_volume_per_reaction * sample_count * excess_rate', safe);
  const polymerase_volume = evaluate('polymerase_volume_per_reaction * sample_count * excess_rate', safe);
  const template_volume = evaluate('template_volume_per_reaction * sample_count * excess_rate', safe);
  const water_volume = evaluate(
    'sample_count * reaction_volume * excess_rate - (dntp_volume_per_reaction + primer_f_volume_per_reaction + primer_r_volume_per_reaction + polymerase_volume_per_reaction + template_volume_per_reaction) * sample_count * excess_rate',
    safe,
  );

  return {
    total_volume,
    buffer_volume,
    dntp_volume,
    primer_f_volume,
    primer_r_volume,
    polymerase_volume,
    template_volume,
    water_volume,
  };
}
