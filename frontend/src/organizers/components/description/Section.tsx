import classNames from 'classnames';
import React, { ReactNode } from 'react';

interface SectionProps {
  className?: string;
  children: ReactNode;
}

export const Section = ({ children, className }: SectionProps): JSX.Element => (
  <div className={classNames('border-t border-gray-200 px-4 py-5 sm:px-6', className)}>
    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">{children}</dl>
  </div>
);

interface NamedSectionProps extends SectionProps {
  name: string;
}

export const NamedSection = ({ name, children, className }: NamedSectionProps): JSX.Element => (
  <div className={classNames('border-t border-gray-200 px-4 py-5 sm:px-6', className)}>
    <h3 className="text-md leading-6 font-medium text-gray-700">{name}</h3>
    <dl className="mt-3 ml-5 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">{children}</dl>
  </div>
);
