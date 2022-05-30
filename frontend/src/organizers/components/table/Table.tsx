import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';
import classNames from 'classnames';
import React, { ReactNode } from 'react';

import { Order } from './sorting';

interface Props {
  children?: ReactNode;
  className?: string;
}

interface IndexedProps extends Props {
  index?: boolean;
}

const Head = ({ children, className }: Props): JSX.Element => (
  <thead className={classNames('bg-gray-50', className)}>
    <tr>{children}</tr>
  </thead>
);

const Label = ({ children, className, index = false }: IndexedProps): JSX.Element => (
  <th
    scope="col"
    className={classNames(
      'text-left text-sm font-semibold text-gray-500 uppercase',
      index ? 'py-3.5 pl-4 pr-3 sm:pl-6' : 'py-3.5 px-3',
      className,
    )}
  >
    {children}
  </th>
);

interface SortableLabelProps<Key> extends IndexedProps {
  by: Key;
  currentKey: Key;
  currentOrder: Order;
  onClick: (key: Key) => () => void;
}

const SortableLabel = <Key,>({
  children,
  className,
  index = false,
  by,
  currentKey,
  currentOrder,
  onClick,
}: SortableLabelProps<Key>): JSX.Element => (
  <th
    scope="col"
    className={classNames(
      'text-left text-sm font-semibold text-gray-500',
      index ? 'py-3.5 pl-4 pr-3 sm:pl-6' : 'px-3 py-3.5',
      className,
    )}
  >
    <button type="button" className="group inline-flex" onClick={onClick(by)}>
      <span className="font-semibold uppercase">{children}</span>
      <span
        className={classNames(
          currentKey === by
            ? 'bg-gray-200 text-gray-900 group-hover:bg-gray-300'
            : 'invisible text-gray-400 group-hover:visible group-focus:visible',
          'ml-2 flex-none rounded',
        )}
      >
        {currentKey === by && currentOrder === Order.Ascending ? (
          <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
        ) : (
          <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
        )}
      </span>
    </button>
  </th>
);

const Body = ({ children, className }: Props): JSX.Element => (
  <tbody className={classNames('divide-y divide-gray-200 bg-white', className)}>{children}</tbody>
);

const Data = ({ children, className, index = false }: IndexedProps): JSX.Element => (
  <td
    className={classNames(
      'whitespace-nowrap text-sm py-4',
      index ? 'pl-4 sm:pl-6 pr-3 font-medium text-gray-900' : 'px-3 text-gray-500',
      className,
    )}
  >
    {children}
  </td>
);

const Table = ({ children, className = 'mt-5' }: Props): JSX.Element => (
  <div className={classNames('flex flex-col', className)}>
    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">{children}</table>
        </div>
      </div>
    </div>
  </div>
);

Table.Head = Head;
Table.Label = Label;
Table.SortableLabel = SortableLabel;
Table.Body = Body;
Table.Data = Data;

export default Table;
