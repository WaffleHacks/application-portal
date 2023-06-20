import { CheckCircleIcon, DocumentTextIcon, XCircleIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import React, { ReactNode } from 'react';

import Card from 'components/Card';

type Kind = 'pending' | 'success' | 'failure';

interface Props {
  kind: Kind;
  standalone?: boolean;
  title: ReactNode;
  children?: ReactNode;
}

const Status = ({ kind, standalone, title, children }: Props): JSX.Element => {
  const body = (
    <>
      <div
        className={classNames('mx-auto flex items-center justify-center h-12 w-12 rounded-full', {
          'bg-green-100': kind === 'success',
          'bg-red-100': kind === 'failure',
          'bg-yellow-100': kind === 'pending',
        })}
      >
        {kind === 'success' && <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />}
        {kind === 'failure' && <XCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />}
        {kind === 'pending' && <DocumentTextIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />}
      </div>
      <div className="mt-3 text-center sm:mt-5">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
        <div className="mt-2 flex justify-center">
          <p className="text-sm text-gray-500 max-w-md">{children}</p>
        </div>
      </div>
    </>
  );

  if (standalone) return <div>{body}</div>;
  else return <Card>{body}</Card>;
};

export default Status;
