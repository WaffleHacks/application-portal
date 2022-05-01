import React, { ReactNode } from 'react';

interface ItemProps {
  wide?: boolean;
  name: string;
  value: ReactNode;
}

export const Item = ({ name, value, wide = false }: ItemProps): JSX.Element => (
  <div className={wide ? 'sm:grid-cols-1' : ''}>
    <dt className="text-sm font-medium text-gray-500">{name}</dt>
    <dd className="mt-1 text-sm text-gray-900">{value}</dd>
  </div>
);

interface ExternalLinkItemProps extends ItemProps {
  value: string | undefined;
}

export const ExternalLinkItem = ({ name, value, wide }: ExternalLinkItemProps): JSX.Element => {
  const link = !value ? (
    'N/A'
  ) : (
    <a href={value} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 hover:underline">
      {value}
    </a>
  );
  return <Item name={name} value={link} wide={wide} />;
};
