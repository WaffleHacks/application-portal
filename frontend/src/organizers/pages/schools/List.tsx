import { PlusIcon } from '@heroicons/react/outline';
import React from 'react';

import { LinkButton } from '../../../components/buttons';
import Link from '../../../components/Link';
import { SchoolList, useListSchoolsQuery } from '../../../store';
import { EmptyRow, LoadingRow, Pagination, Table, usePagination } from '../../components/table';
import Search from './Search';

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
  const { paginated, ...paginationProps } = usePagination(data);

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700">All the different schools participants can attend.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2">
        <Search />

        <div className="mt-5 max-h-10 flex justify-end">
          <LinkButton size="sm" to="/schools/new">
            <PlusIcon className="h-4 w-4 mr-2" />
            New
          </LinkButton>
        </div>
      </div>

      <Table>
        <Table.Head>
          <Table.Label index>Name</Table.Label>
          <Table.Label>Applications</Table.Label>
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
