import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface Props {
  reason: string;
}

const WarningFlag = ({ reason }: Props): JSX.Element => (
  <div className="has-tooltip">
    <span className="tooltip text-sm rounded shadow-lg border border-gray-10000 p-1 text-gray-800 bg-gray-50 mt-6">
      {reason}
    </span>
    <ExclamationTriangleIcon className="ml-1 text-yellow-500 w-5 h-5" aria-hidden="true" />
  </div>
);

export default WarningFlag;
