import React, { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
}

export const Section = ({ children }: SectionProps): JSX.Element => (
  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">{children}</dl>
  </div>
);

interface NamedSectionProps {
  name: string;
  children: ReactNode;
}

export const NamedSection = ({ name, children }: NamedSectionProps): JSX.Element => (
  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
    <h3 className="text-md leading-6 font-medium text-gray-700">{name}</h3>
    <dl className="mt-3 ml-5 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">{children}</dl>
  </div>
);
