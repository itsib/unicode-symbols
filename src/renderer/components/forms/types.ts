export type ValidateResult = string | null;

export interface IFormControlBase<T> {
  id: string;
  name?: string;
  label?: string;
  value?: T;
  onChange?: (value?: T) => void;
  validate?: (value?: T) => ValidateResult;
}