import { PlusIcon, SearchIcon } from '@heroicons/react/outline';
import React, { useState } from 'react';

import { LinkButton } from '../../../components/buttons';
import Link from '../../../components/Link';
import { School, useListSchoolsQuery } from '../../../store';
import { EmptyRow, LoadingRow, Pagination, Table, usePagination } from '../../components/table';

const Row = (school: School): JSX.Element => (
  <tr>
    <Table.Data index>{school.name}</Table.Data>
    <Table.Data className="relative text-right sm:pr-6">
      <Link to={`/schools/${school.id}`} className="text-indigo-600 hover:text-indigo-900">
        Details
      </Link>
    </Table.Data>
  </tr>
);

const List = (): JSX.Element => {
  const [search, setSearch] = useState('');
  const { data = [], isLoading } = useListSchoolsQuery();

  const filtered = data.filter((s) => s.name.toLowerCase().startsWith(search));
  const { paginated, ...paginationProps } = usePagination(filtered);

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700">All the different schools participants can attend.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2">
        {/* TODO: implement search using Algolia */}
        <div className="max-w-md">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

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
