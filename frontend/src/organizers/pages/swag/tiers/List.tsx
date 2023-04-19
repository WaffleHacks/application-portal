import { PlusIcon } from '@heroicons/react/24/outline';
import React from 'react';

import { LinkButton } from '../../../../components/buttons';
import Link from '../../../../components/Link';
import { ReducedSwagTier, useListSwagTiersQuery } from '../../../../store';
import { EmptyRow, LoadingRow, Pagination, Table, usePagination } from '../../../components/table';

const Row = (tier: ReducedSwagTier): JSX.Element => (
  <tr>
    <Table.Data index>{tier.name}</Table.Data>
    <Table.Data>{tier.required_attendance}</Table.Data>
    <Table.Data className="relative text-right sm:pr-6">
      <Link to={`/swag/tiers/${tier.id}`} className="text-indigo-600 hover:text-indigo-900">
        Details
      </Link>
    </Table.Data>
  </tr>
);

const List = (): JSX.Element => {
  const { data = [], isLoading } = useListSwagTiersQuery();
  const { paginated, ...paginationProps } = usePagination(data);

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700">
            Manage the tiers of swag participants can receive for attending workshops.
          </p>
        </div>
      </div>

      <div className="mt-2 flex justify-end">
        <LinkButton to="/swag/tiers/new">
          <PlusIcon className="h-4 w-4 mr-2" aria-hidden="true" />
          New
        </LinkButton>
      </div>

      <Table>
        <Table.Head>
          <Table.Label index>Name</Table.Label>
          <Table.Label>Workshops required</Table.Label>
          <Table.InvisibleLabel>View</Table.InvisibleLabel>
        </Table.Head>
        <Table.Body>
          {isLoading && <LoadingRow />}
          {!isLoading && paginated.length === 0 && (
            <EmptyRow
              message="No swag tiers yet, get started by creating one."
              callToAction={
                <LinkButton to="/swag/tiers/new">
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  New message
                </LinkButton>
              }
            />
          )}
          {!isLoading && paginated.map((t) => <Row key={t.id} {...t} />)}
        </Table.Body>
      </Table>

      <Pagination {...paginationProps} />
    </>
  );
};

export default List;
