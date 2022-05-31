import classNames from 'classnames';
import React, { ComponentProps, ReactNode } from 'react';

import Card from '../../components/Card';

type Color = 'red' | 'yellow' | 'green';

interface Props {
  icon: (props: ComponentProps<'svg'>) => JSX.Element;
  color: Color;
  title: string;
  children?: ReactNode;
}

const StatusDescription = ({ color, icon: Icon, title, children }: Props): JSX.Element => (
  <Card>
    <div>
      <div
        className={classNames('mx-auto flex items-center justify-center h-12 w-12 rounded-full', {
          'bg-green-100': color === 'green',
          'bg-red-100': color === 'red',
          'bg-yellow-100': color === 'yellow',
        })}
      >
        <Icon
          className={classNames('h-6 w-6', {
            'text-green-600': color === 'green',
            'text-red-600': color === 'red',
            'text-yellow-600': color === 'yellow',
          })}
          aria-hidden="true"
        />
      </div>
      <div className="mt-3 text-center sm:mt-5">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
        <div className="mt-2 flex justify-center">
          <p className="text-sm text-gray-500 max-w-md">{children}</p>
        </div>
      </div>
    </div>
  </Card>
);

export default StatusDescription;
