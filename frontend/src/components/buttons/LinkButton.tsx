import React from 'react';
import { Link } from 'react-router-dom';

import { BaseProps, classes } from './base';

interface Props extends BaseProps {
  to: string;
  external?: boolean;
}

const LinkButton = ({
  to,
  className,
  style = 'primary',
  size = 'md',
  rounded = 'part',
  external = false,
  children,
}: Props): JSX.Element => {
  if (external) {
    return (
      <a href={to} target="_blank" rel="noreferrer" className={classes(size, style, rounded, className)}>
        {children}
      </a>
    );
  } else {
    return (
      <Link to={to} className={classes(size, style, rounded, className)}>
        {children}
      </Link>
    );
  }
};

export default LinkButton;
