import React from 'react';

import { EmptyRow, LoadingRow, Pagination, Table, usePagination } from 'organizers/components/table';
import { useListIncompleteApplicationsQuery } from 'store';

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
          <Table.Label index>Name</Table.Label>
          <Table.Label>Email</Table.Label>
        </Table.Head>
        <Table.Body>
          {isLoading && <LoadingRow />}
          {!isLoading && paginated.length === 0 && <EmptyRow message="No incomplete applications yet!" />}
          {!isLoading &&
            paginated.map((p) => (
              <tr key={p.id}>
                <Table.Data index>
                  {p.first_name} {p.last_name}
                </Table.Data>
                <Table.Data>{p.email}</Table.Data>
              </tr>
            ))}
        </Table.Body>
      </Table>

      <Pagination {...paginationProps} />
    </>
  );
};

export default IncompleteList;
