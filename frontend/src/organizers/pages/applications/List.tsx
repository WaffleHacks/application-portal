import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import React, { useCallback, useState } from 'react';

import Link from '../../../components/Link';
import { ReducedApplication, Status, useListApplicationsQuery } from '../../../store';
import { EmptyRow, LoadingRow, Pagination, Table } from '../../components/table';

enum SortKey {
  Name,
  Email,
  Country,
  AppliedAt,
}

enum SortOrder {
  Ascending,
  Descending,
}

const getKey = (app: ReducedApplication, key: SortKey): string => {
  switch (key) {
    case SortKey.Name:
      return `${app.participant.first_name} ${app.participant.last_name}`;
    case SortKey.Email:
      return app.participant.email;
    case SortKey.Country:
      return app.country;
    case SortKey.AppliedAt:
      return app.created_at;
  }
};

const sort =
  (by: SortKey, order: SortOrder) =>
  (a: ReducedApplication, b: ReducedApplication): number => {
    const keyA = getKey(a, by);
    const keyB = getKey(b, by);

    if (keyA === keyB) return 0;

    // Different handling for times
    if (by === SortKey.AppliedAt) {
      if (keyA > keyB) return order === SortOrder.Descending ? -1 : 1;
      else return order === SortOrder.Descending ? 1 : -1;
    } else {
      if (keyA > keyB) return order === SortOrder.Descending ? 1 : -1;
      else return order === SortOrder.Descending ? -1 : 1;
    }
  };

interface HeaderProps {
  className?: string;
  currentKey: SortKey;
  currentOrder: SortOrder;
  sortKey: SortKey;
  name: string;
  onClick: (key: SortKey) => () => void;
}

const Header = ({
  className = 'px-3 py-3.5',
  currentKey,
  currentOrder,
  name,
  sortKey,
  onClick,
}: HeaderProps): JSX.Element => (
  <th scope="col" className={classNames('text-left text-sm font-semibold text-gray-500', className)}>
    <button type="button" className="group inline-flex" onClick={onClick(sortKey)}>
      <span className="font-semibold uppercase">{name}</span>
      <span
        className={classNames(
          currentKey === sortKey
            ? 'bg-gray-200 text-gray-900 group-hover:bg-gray-300'
            : 'invisible text-gray-400 group-hover:visible group-focus:visible',
          'ml-2 flex-none rounded',
        )}
      >
        {currentKey === sortKey && currentOrder === SortOrder.Ascending ? (
          <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
        ) : (
          <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
        )}
      </span>
    </button>
  </th>
);

const Row = (application: ReducedApplication): JSX.Element => {
  const createdAt = DateTime.fromISO(application.created_at);
  const formattedCreatedAt =
    createdAt.diffNow().negate().as('days') > 1
      ? createdAt.toLocaleString(DateTime.DATETIME_SHORT)
      : createdAt.toRelative();

  return (
    <tr>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
        {application.participant.first_name} {application.participant.last_name}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{application.participant.email}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{application.country}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formattedCreatedAt}</td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <Link to={`/applications/${application.participant.id}`} className="text-indigo-600 hover:text-indigo-900">
          Details
        </Link>
      </td>
    </tr>
  );
};

interface Props {
  status: Status;
}

const List = ({ status }: Props): JSX.Element => {
  const { data, isLoading } = useListApplicationsQuery();

  const [page, setPage] = useState(0);

  const [sortBy, setSortBy] = useState(SortKey.AppliedAt);
  const [sortOrder, setSortOrder] = useState(SortOrder.Descending);
  const ordered = (data || [])
    .filter((a) => a.status === status)
    .slice()
    .sort(sort(sortBy, sortOrder));

  const maxPage = Math.floor(ordered.length / 20);
  const paginated = ordered.slice(20 * page, 20 + 20 * page);

  const onClick = useCallback(
    (key: SortKey) => () => {
      if (sortBy !== key) setSortOrder(SortOrder.Descending);
      else setSortOrder(sortOrder === SortOrder.Descending ? SortOrder.Ascending : SortOrder.Descending);

      setSortBy(key);
    },
    [sortBy, sortOrder],
  );

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700">
            The name, email, country, and application date of all participants with {status} applications.
          </p>
        </div>
      </div>
      <Table>
        <Table.Head>
          <Header
            className="py-3.5 pl-4 pr-3 sm:pl-6"
            currentKey={sortBy}
            currentOrder={sortOrder}
            sortKey={SortKey.Name}
            name="Name"
            onClick={onClick}
          />
          <Header currentKey={sortBy} currentOrder={sortOrder} name="Email" sortKey={SortKey.Email} onClick={onClick} />
          <Header
            currentKey={sortBy}
            currentOrder={sortOrder}
            sortKey={SortKey.Country}
            name="Country"
            onClick={onClick}
          />
          <Header
            currentKey={sortBy}
            currentOrder={sortOrder}
            sortKey={SortKey.AppliedAt}
            name="Applied At"
            onClick={onClick}
          />
          <th scope="col" className="relative py-3 pl-3 pr-4 sm:pr-6">
            <span className="sr-only">View</span>
          </th>
        </Table.Head>
        <Table.Body>
          {isLoading && <LoadingRow />}
          {!isLoading && paginated.length === 0 && <EmptyRow message={`No ${status} applications yet.`} />}
          {!isLoading && paginated.map((a) => <Row key={a.participant.id} {...a} />)}
        </Table.Body>
      </Table>

      <Pagination page={page} setPage={setPage} max={maxPage} />
    </>
  );
};

export default List;
