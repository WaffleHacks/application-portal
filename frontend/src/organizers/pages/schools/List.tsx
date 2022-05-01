import { SearchIcon } from '@heroicons/react/outline';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { useListSchoolsQuery } from '../../../store';
import { EmptyRow, LoadingRow, Pagination, Table } from '../../components/table';

const List = (): JSX.Element => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { data = [], isLoading } = useListSchoolsQuery();

  const filtered = data.filter((s) => s.name.toLowerCase().startsWith(search));

  const maxPage = Math.floor(filtered.length / 20);
  const paginated = filtered.slice(20 * page, 20 + 20 * page);

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700">All the different schools participants can attend.</p>
        </div>
      </div>

      {/* TODO: implement search using Algolia */}
      <div className="max-w-md mt-5">
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

      <Table>
        <Table.Head>
          <th scope="col" className="text-left text-sm font-semibold text-gray-500 uppercase py-3.5 pl-4 pr-3 sm:pl-6">
            Name
          </th>
          <th scope="col" className="relative py-3 pl-3 pr-4 sm:pr-6">
            <span className="sr-only">View</span>
          </th>
        </Table.Head>
        <Table.Body>
          {isLoading && <LoadingRow />}
          {!isLoading && paginated.length === 0 && <EmptyRow message="No schools present. Was the database seeded?" />}
          {!isLoading &&
            paginated.map((s) => (
              <tr key={s.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{s.name}</td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <Link to={`/schools/${s.id}`} className="text-indigo-600 hover:text-indigo-900">
                    Details
                  </Link>
                </td>
              </tr>
            ))}
        </Table.Body>
      </Table>

      <Pagination page={page} setPage={setPage} max={maxPage} />
    </>
  );
};

export default List;
