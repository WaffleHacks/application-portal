import { DocumentIcon, RefreshIcon } from '@heroicons/react/outline';
import React from 'react';

export const LoadingRow = (): JSX.Element => (
  <tr>
    <td colSpan={5}>
      <div className="flex justify-around py-5">
        <RefreshIcon className="h-8 w-8 animate-spin" />
      </div>
    </td>
  </tr>
);

interface EmptyRowProps {
  message: string;
}

export const EmptyRow = ({ message }: EmptyRowProps): JSX.Element => (
  <tr>
    <td colSpan={5}>
      <div className="text-center py-5">
        <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">{message}</h3>
      </div>
    </td>
  </tr>
);
