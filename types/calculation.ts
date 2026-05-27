export type DilutionMode = 'v1' | 'c2' | 'v2';

export type PCRInputs = {
  sample_count: number;
  reaction_volume: number;
  excess_rate: number;
  buffer_ratio: number;
  dntp_volume_per_reaction: number;
  primer_f_volume_per_reaction: number;
  primer_r_volume_per_reaction: number;
  polymerase_volume_per_reaction: number;
  template_volume_per_reaction: number;
};

export type DilutionInputs = {
  c1?: number;
  v1?: number;
  c2?: number;
  v2?: number;
};

export type MolarityInputs = {
  mass: number;
  molecular_weight: number;
  volume_ml: number;
};

export type CustomCalculation = {
  id: string;
  name: string;
  inputs: { key: string; label: string; defaultValue: number }[];
  formulas: { key: string; expression: string; label: string }[];
};
