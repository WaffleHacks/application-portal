import { DateTime } from 'luxon';
import React from 'react';

import Link from '../../../components/Link';
import { ReducedApplication, Status, useListApplicationsQuery } from '../../../store';
import { EmptyRow, LoadingRow, Order, Pagination, Table, usePagination, useSorting } from '../../components/table';

enum SortKey {
  Name,
  Email,
  Country,
  AppliedAt,
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
  (by: SortKey, order: Order) =>
  (a: ReducedApplication, b: ReducedApplication): number => {
    const keyA = getKey(a, by);
    const keyB = getKey(b, by);

    if (keyA === keyB) return 0;

    // Different handling for times
    if (by === SortKey.AppliedAt) {
      if (keyA > keyB) return order === Order.Descending ? -1 : 1;
      else return order === Order.Descending ? 1 : -1;
    } else {
      if (keyA > keyB) return order === Order.Descending ? 1 : -1;
      else return order === Order.Descending ? -1 : 1;
    }
  };

const Row = (application: ReducedApplication): JSX.Element => {
  const createdAt = DateTime.fromISO(application.created_at);
  const formattedCreatedAt =
    createdAt.diffNow().negate().as('days') > 1
      ? createdAt.toLocaleString(DateTime.DATETIME_SHORT)
      : createdAt.toRelative();

  return (
    <tr>
      <Table.Data index>
        {application.participant.first_name} {application.participant.last_name}
      </Table.Data>
      <Table.Data>{application.participant.email}</Table.Data>
      <Table.Data>{application.country}</Table.Data>
      <Table.Data>{formattedCreatedAt}</Table.Data>
      <Table.Data className="relative text-right sm:pr-6">
        <Link to={`/applications/${application.participant.id}`} className="text-indigo-600 hover:text-indigo-900">
          Details
        </Link>
      </Table.Data>
    </tr>
  );
};

interface Props {
  status: Status;
}

const List = ({ status }: Props): JSX.Element => {
  const { data, isLoading } = useListApplicationsQuery();

  const filtered = (data || []).filter((a) => a.status === status);

  const { sorted, ...sortableProps } = useSorting<SortKey, ReducedApplication>(filtered, sort, SortKey.AppliedAt);
  const { paginated, ...paginationProps } = usePagination(sorted);

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
          <Table.SortableLabel index by={SortKey.Name} {...sortableProps}>
            Name
          </Table.SortableLabel>
          <Table.SortableLabel by={SortKey.Email} {...sortableProps}>
            Email
          </Table.SortableLabel>
          <Table.SortableLabel by={SortKey.Country} {...sortableProps}>
            Country
          </Table.SortableLabel>
          <Table.SortableLabel by={SortKey.AppliedAt} {...sortableProps}>
            Applied At
          </Table.SortableLabel>
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

      <Pagination {...paginationProps} />
    </>
  );
};

export default List;
