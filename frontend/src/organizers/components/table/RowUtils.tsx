import { ArrowPathIcon, DocumentIcon } from '@heroicons/react/24/outline';
import React, { ReactNode } from 'react';

interface RowSpan {
  span?: number;
}

export const LoadingRow = ({ span = 5 }: RowSpan): JSX.Element => (
  <tr>
    <td colSpan={span}>
      <div className="flex justify-around py-5">
        <ArrowPathIcon className="h-8 w-8 animate-spin" />
      </div>
    </td>
  </tr>
);

interface EmptyRowProps extends RowSpan {
  message: string;
  callToAction?: ReactNode;
}

export const EmptyRow = ({ message, callToAction, span = 5 }: EmptyRowProps): JSX.Element => (
  <tr>
    <td colSpan={span}>
      <div className="text-center py-5">
        <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">{message}</h3>
        {callToAction && <div className="mt-6">{callToAction}</div>}
      </div>
    </td>
  </tr>
);
