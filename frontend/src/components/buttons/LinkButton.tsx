import React from 'react';
import { Link } from 'react-router-dom';

import { BaseProps, classes } from './base';

interface Props extends BaseProps {
  to: string;
}

const LinkButton = ({
  to,
  className,
  style = 'primary',
  size = 'md',
  rounded = 'part',
  children,
}: Props): JSX.Element => (
  <Link to={to} className={classes(size, style, rounded, className)}>
    {children}
  </Link>
);

export default LinkButton;
