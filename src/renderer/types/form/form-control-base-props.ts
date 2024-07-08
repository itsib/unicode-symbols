import { FormValidateResult } from './form-validate-result';

export interface FormControlBaseProps<T> {
  id: string;
  name?: string;
  label?: string;
  value?: T;
  onChange?: (value?: T) => void;
  validate?: (value?: T) => FormValidateResult;
  debounce?: number;
  disabled?: boolean;
}