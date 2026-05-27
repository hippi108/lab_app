export type ProtocolVariable = {
  id: string;
  key: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'boolean';
  unit?: string;
  defaultValue?: string | number | boolean;
  description?: string;
};

export type ProtocolBlock =
  | HeadingBlock
  | TextBlock
  | MaterialsBlock
  | StepBlock
  | ChecklistBlock
  | CalculationBlock
  | TimerBlock
  | CounterBlock
  | NoteBlock
  | ReferenceBlock;

export type Protocol = {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  tags: string[];
  version: number;
  status: 'draft' | 'published' | 'archived';
  variables: ProtocolVariable[];
  blocks: ProtocolBlock[];
  references: PaperReference[];
  createdAt: string;
  updatedAt: string;
};

export type HeadingBlock = {
  id: string;
  type: 'heading';
  text: string;
};

export type TextBlock = {
  id: string;
  type: 'text';
  text: string;
};

export type MaterialsBlock = {
  id: string;
  type: 'materials';
  title: string;
  items: { name: string; amount: string }[];
};

export type StepBlock = {
  id: string;
  type: 'step';
  step: string;
};

export type ChecklistBlock = {
  id: string;
  type: 'checklist';
  items: { id: string; text: string; checked?: boolean }[];
};

export type CalculationInput = {
  id: string;
  key: string;
  label: string;
  unit?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  required?: boolean;
};

export type CalculationConstant = {
  id: string;
  key: string;
  label: string;
  value: number;
  unit?: string;
};

export type CalculationFormula = {
  id: string;
  key: string;
  label: string;
  expression: string;
  unit?: string;
};

export type CalculationOutput = {
  id: string;
  key: string;
  label: string;
  unit?: string;
};

export type CalculationBlock = {
  id: string;
  type: 'calculation';
  title: string;
  description?: string;
  inputs: CalculationInput[];
  constants: CalculationConstant[];
  formulas: CalculationFormula[];
  outputs: CalculationOutput[];
};

export type TimerBlock = {
  id: string;
  type: 'timer';
  title: string;
  durationSeconds: number;
};

export type CounterBlock = {
  id: string;
  type: 'counter';
  title: string;
  initialValue: number;
};

export type NoteBlock = {
  id: string;
  type: 'note';
  text: string;
};

export type ReferenceBlock = {
  id: string;
  type: 'reference';
  title: string;
  paperId: string;
};

export type PaperReference = {
  id: string;
  paperId: string;
  note?: string;
};
