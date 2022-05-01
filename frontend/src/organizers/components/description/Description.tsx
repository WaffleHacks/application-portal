import React, { ReactNode } from 'react';

interface Props {
  title: string;
  titleLeft?: ReactNode;
  subtitle?: string;
  children: ReactNode;
}

const Description = ({ title, titleLeft, subtitle, children }: Props): JSX.Element => (
  <div className="mt-5 bg-white shadow overflow-hidden sm:rounded-lg">
    <div className="px-4 py-5 sm:px-6">
      <div className="flex justify-between">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
        {titleLeft}
      </div>
      {subtitle && <p className="mt-1 max-w-2xl text-sm text-gray-500">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export default Description;