import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { Link as InternalLink } from 'react-router-dom';

interface Props {
  children: ReactNode;
  className?: string;
  external?: boolean;
  to: string;
}

const Link = ({ children, className, external = false, to }: Props): JSX.Element => {
  if (external) {
    return (
      <a
        href={to}
        className={classNames('text-blue-500 hover:text-blue-600', className)}
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    );
  } else {
    return (
      <InternalLink to={to} className={classNames('text-blue-500 hover:text-blue-600', className)}>
        {children}
      </InternalLink>
    );
  }
};

export default Link;
