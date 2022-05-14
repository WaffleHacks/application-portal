import classNames from 'classnames';
import React, { ReactNode } from 'react';

export type Color = 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink';

interface Props {
  children?: ReactNode;
  className?: string;
  color?: Color;
  large?: boolean;
  rounded?: boolean;
}

const Badge = ({ children, className, color = 'gray', large = false, rounded = false }: Props): JSX.Element => (
  <span
    className={classNames(
      className,
      'inline-flex items-center px-2.5 py-0.5 font-medium',
      large ? 'text-sm' : 'text-xs',
      rounded ? 'rounded-full' : 'rounded-md',
      {
        'bg-gray-100 text-gray-800': color === 'gray',
        'bg-red-100 text-red-800': color === 'red',
        'bg-yellow-100 text-yellow-800': color === 'yellow',
        'bg-green-100 text-green-800': color === 'green',
        'bg-blue-100 text-blue-800': color === 'blue',
        'bg-indigo-100 text-indigo-800': color === 'indigo',
        'bg-purple-100 text-purple-800': color === 'purple',
        'bg-pink-100 text-pink-800': color === 'pink',
      },
    )}
  >
    {children}
  </span>
);

export default Badge;
