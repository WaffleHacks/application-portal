import React from 'react';

import { useListIncompleteApplicationsQuery } from '../../../store';
import { EmptyRow, LoadingRow, Pagination, Table, usePagination } from '../../components/table';

const IncompleteList = (): JSX.Element => {
  const { data = [], isLoading } = useListIncompleteApplicationsQuery();
  const { paginated, ...paginationProps } = usePagination(data);

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700">
            The name and email of all participants with incomplete applications.
          </p>
        </div>
      </div>
      <Table>
        <Table.Head>
          <th scope="col" className="text-left text-sm font-semibold text-gray-500 uppercase py-3.5 pl-4 pr-3 sm:pl-6">
            Name
          </th>
          <th scope="col" className="text-left text-sm font-semibold text-gray-500 uppercase px-3 py-3.5">
            Email
          </th>
        </Table.Head>
        <Table.Body>
          {isLoading && <LoadingRow />}
          {!isLoading && paginated.length === 0 && <EmptyRow message="No incomplete applications yet!" />}
          {!isLoading &&
            paginated.map((p) => (
              <tr key={p.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {p.first_name} {p.last_name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{p.email}</td>
              </tr>
            ))}
        </Table.Body>
      </Table>

      <Pagination {...paginationProps} />
    </>
  );
};

export default IncompleteList;
