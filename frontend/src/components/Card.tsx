import classNames from 'classnames';
import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className }: Props): JSX.Element => (
  <div className={classNames('bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mt-3', className)}>{children}</div>
);

export default Card;
