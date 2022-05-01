import classNames from 'classnames';
import React from 'react';

import { Status } from '../../store/types';

interface Props {
  status: Status;
  large?: boolean;
}

const StatusBadge = ({ large = false, status }: Props): JSX.Element => (
  <span
    className={classNames(
      'inline-flex items-center px-2.5 py-0.5 rounded-md font-medium',
      large ? 'text-sm' : 'text-xs',
      {
        'text-green-800 bg-green-100': status === Status.Accepted,
        'text-yellow-800 bg-yellow-100': status === Status.Pending,
        'text-red-800 bg-red-100': status === Status.Rejected,
      },
    )}
  >
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

export default StatusBadge;
