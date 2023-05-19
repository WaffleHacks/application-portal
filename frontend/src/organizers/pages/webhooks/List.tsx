import { PlusIcon } from '@heroicons/react/24/outline';
import React from 'react';

import Badge from 'components/Badge';
import { LinkButton } from 'components/buttons';
import Link from 'components/Link';
import { EmptyRow, LoadingRow, Pagination, Table, usePagination } from 'organizers/components/table';
import { ReducedWebhook, useListWebhooksQuery } from 'store';

const Row = ({ url, enabled, id }: ReducedWebhook): JSX.Element => (
  <tr>
    <Table.Data index>{url}</Table.Data>
    <Table.Data>
      <Badge color={enabled ? 'green' : 'red'}>{enabled ? 'Yes' : 'No'}</Badge>
    </Table.Data>
    <Table.Data className="relative text-right sm:pr-6">
      <Link to={`/webhooks/${id}`} className="text-indigo-600 hover:text-indigo-900">
        Details
      </Link>
    </Table.Data>
  </tr>
);

const List = (): JSX.Element => {
  const { data = [], isLoading } = useListWebhooksQuery();
  const { paginated, ...paginationProps } = usePagination(data);

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700">Configure external webhooks</p>
        </div>
      </div>

      <div className="mt-2 flex justify-end">
        <LinkButton to="/webhooks/new">
          <PlusIcon className="h-4 w-4 mr-2" />
          New
        </LinkButton>
      </div>

      <Table className="mt-2">
        <Table.Head>
          <Table.Label index>URL</Table.Label>
          <Table.Label>Status</Table.Label>
          <Table.InvisibleLabel>View</Table.InvisibleLabel>
        </Table.Head>
        <Table.Body>
          {isLoading && <LoadingRow />}
          {!isLoading && paginated.length === 0 && (
            <EmptyRow
              message="No webhooks yet, get started by creating one."
              callToAction={
                <Link
                  to="/webhooks/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  New webhook
                </Link>
              }
            />
          )}
          {!isLoading && paginated.map((w) => <Row key={w.id} {...w} />)}
        </Table.Body>
      </Table>

      <Pagination {...paginationProps} />
    </>
  );
};

export default List;
