import { DocumentDuplicateIcon, PlusIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import Search from './Search';
import { LinkButton } from '../../../components/buttons';
import Link from '../../../components/Link';
import { SchoolList, useListSchoolsQuery } from '../../../store';
import { EmptyRow, LoadingRow, Order, Pagination, Table, usePagination, useSorting } from '../../components/table';

enum SortKey {
  Name,
  Applications,
}

const compare = <T,>(a: T, b: T, order: Order): number => {
  if (a === b) return 0;
  else if (a > b) return order === Order.Descending ? -1 : 1;
  else return order === Order.Descending ? 1 : -1;
};

const sort =
  (by: SortKey, order: Order) =>
  (a: SchoolList, b: SchoolList): number => {
    switch (by) {
      case SortKey.Name:
        return compare(a.name, b.name, order) * -1;
      case SortKey.Applications:
        return compare(a.count, b.count, order);
    }
  };

const Row = (school: SchoolList): JSX.Element => (
  <tr>
    <Table.Data index>{school.name}</Table.Data>
    <Table.Data>{school.count}</Table.Data>
    <Table.Data className="relative text-right sm:pr-6">
      <Link to={`/schools/${school.id}`} className="text-indigo-600 hover:text-indigo-900">
        Details
      </Link>
    </Table.Data>
  </tr>
);

const List = (): JSX.Element => {
  const { data = [], isLoading } = useListSchoolsQuery();
  const { sorted, ...sortableProps } = useSorting<SortKey, SchoolList>(data, sort, SortKey.Applications);
  const { paginated, ...paginationProps } = usePagination(sorted);

  const navigate = useNavigate();

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700">All the different schools participants can attend.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2">
        <Search onClick={(item) => navigate(`/schools/${item.objectID}`)} />

        <div className="mt-5 max-h-10 flex justify-end space-x-2">
          <LinkButton size="sm" style="secondary" to="/schools/merge">
            <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
            Merge
          </LinkButton>
          <LinkButton size="sm" to="/schools/new">
            <PlusIcon className="h-4 w-4 mr-2" />
            New
          </LinkButton>
        </div>
      </div>

      <Table>
        <Table.Head>
          <Table.SortableLabel index by={SortKey.Name} {...sortableProps}>
            Name
          </Table.SortableLabel>
          <Table.SortableLabel by={SortKey.Applications} {...sortableProps}>
            Applications
          </Table.SortableLabel>
          <Table.InvisibleLabel>View</Table.InvisibleLabel>
        </Table.Head>
        <Table.Body>
          {isLoading && <LoadingRow />}
          {!isLoading && paginated.length === 0 && <EmptyRow message="No schools present. Was the database seeded?" />}
          {!isLoading && paginated.map((s) => <Row key={s.id} {...s} />)}
        </Table.Body>
      </Table>

      <Pagination {...paginationProps} />
    </>
  );
};

export default List;
