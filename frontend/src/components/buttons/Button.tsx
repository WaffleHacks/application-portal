import React, { forwardRef } from 'react';

import { BaseProps, classes } from './base';

interface Props extends BaseProps {
  type?: 'submit' | 'button';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const Button = forwardRef<HTMLButtonElement, Props>(
  (
    // These props are defined, but static analysis is limited to in-file definitions
    /* eslint-disable react/prop-types */
    {
      type = 'button',
      className,
      onClick,
      style = 'primary',
      size = 'md',
      rounded = 'part',
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
      className={classes(size, style, rounded, className)}
    >
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
export default Button;
