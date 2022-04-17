import classNames from 'classnames';
import React, { forwardRef } from 'react';

interface Props {
  type?: 'submit' | 'button';
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  style?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, Props>(
  (
    {
      type = 'button',
      className,
      onClick,
      style = 'primary',
      size = 'md',
      rounded = false,
      disabled = false,
      children,
    },
    ref,
  ): JSX.Element => (
    <button
      type={type}
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={classNames(
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
          'text-grey-600 bg-yellow-400 disabled:bg-amber-400 hover:bg-yellow-500': style === 'warning',
          'text-white bg-red-600 disabled:bg-red-400 hover:bg-red-700': style === 'danger',
        },
        rounded ? 'rounded-full' : 'rounded-md',
        'inline-flex items-center border border-transparent font-medium shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75',
      )}
    >
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
export default Button;
