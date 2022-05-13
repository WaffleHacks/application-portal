import React, { ReactNode } from 'react';
import { NavLink as InternalLink } from 'react-router-dom';

interface ActiveProps {
  isActive: boolean;
}

interface Props {
  children: ReactNode | ((props: ActiveProps) => ReactNode);
  className?: string | ((props: ActiveProps) => string | undefined);
  external?: boolean;
  to: string;
}

const Link = ({
  children,
  className = 'text-blue-500 hover:text-blue-600',
  external = false,
  to,
}: Props): JSX.Element => {
  if (external) {
    return (
      <a
        href={to}
        className={typeof className === 'function' ? className({ isActive: false }) : className}
        target="_blank"
        rel="noreferrer"
      >
        {typeof children === 'function' ? children({ isActive: false }) : children}
      </a>
    );
  } else {
    return (
      <InternalLink to={to} className={(props) => (typeof className === 'function' ? className(props) : className)}>
        {(props) => (typeof children === 'function' ? children(props) : children)}
      </InternalLink>
    );
  }
};

export default Link;
