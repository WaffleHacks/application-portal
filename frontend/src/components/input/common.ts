import { FieldHookConfig } from 'formik';
import { nanoid } from 'nanoid';
import { ReactNode } from 'react';

export const generateId = (type: string, label: string | ReactNode): string => {
  if (typeof label === 'string') return `${type}-${label.toLowerCase().replaceAll(' ', '-')}`;
  else return `${type}-${nanoid(8)}`;
};

export type BaseProps<T> = FieldHookConfig<T> & {
  label: string | ReactNode;
};
