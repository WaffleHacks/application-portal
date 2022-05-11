import classNames from 'classnames';
import { ReactNode } from 'react';

type Style = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'white';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Rounding = 'full' | 'part' | 'none';

export interface BaseProps {
  className?: string;
  style?: Style;
  size?: Size;
  rounded?: Rounding;
  children: ReactNode;
}

export const classes = (size: Size, style: Style, rounded: Rounding, className?: string) =>
  classNames(
    className,
    {
      'px-2.5 py-1.5 text-xs': size === 'xs',
      'px-3 py-2 text-sm': size === 'sm',
      'px-4 py-2 text-sm': size === 'md',
      'px-4 py-2 text-base': size === 'lg',
      'px-6 py-3 text-base': size === 'xl',
      'text-white bg-indigo-600 disabled:bg-indigo-600 hover:bg-indigo-700': style === 'primary',
      'text-indigo-700 bg-indigo-100 disabled:bg-indigo-200 hover:bg-indigo-200': style === 'secondary',
      'text-white bg-emerald-600 disabled:bg-emerald-500 hover:bg-emerald-700': style === 'success',
      'text-gray-600 bg-yellow-400 disabled:bg-amber-400 hover:bg-yellow-500': style === 'warning',
      'text-white bg-red-600 disabled:bg-red-400 hover:bg-red-700': style === 'danger',
      'text-gray-700 bg-gray-50 disabled:bg-gray-100 hover:bg-gray-200': style === 'white',
      'rounded-full': rounded === 'full',
      'rounded-md': rounded === 'part',
    },
    'inline-flex items-center border border-transparent font-medium shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75',
  );
