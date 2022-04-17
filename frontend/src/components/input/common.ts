import { nanoid } from 'nanoid';
import { ReactNode } from 'react';

export const generateId = (type: string, label: string | ReactNode): string => {
  if (typeof label === 'string') return `${type}-${label.toLowerCase().replaceAll(' ', '-')}`;
  else return `${type}-${nanoid(8)}`;
};

export interface BaseProps<T> {
  label: string | ReactNode;
  className?: string;
  value?: T;
  onChange: (v: T) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
}
