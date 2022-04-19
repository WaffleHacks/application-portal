import classNames from 'classnames';
import React, { ReactNode } from 'react';

import Card from './Card';

interface Props {
  title: string;
  description?: string;
  className?: string;
  grid?: boolean;
  children: ReactNode;
}

const SidebarCard = ({ title, description, className, children, grid = true }: Props): JSX.Element => (
  <Card className={className}>
    <div className="md:grid md:grid-cols-3 md:gap-6">
      <div className="md:col-span-1">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      <div className="mt-5 md:mt-0 md:col-span-2">
        <div className="space-y-6">
          <div className={classNames('gap-6', { 'grid grid-cols-6': grid })}>{children}</div>
        </div>
      </div>
    </div>
  </Card>
);

export default SidebarCard;
