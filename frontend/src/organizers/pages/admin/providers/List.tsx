import { PlusIcon } from '@heroicons/react/outline';
import React from 'react';

import Badge from '../../../../components/Badge';
import { LinkButton } from '../../../../components/buttons';
import Link from '../../../../components/Link';
import { useListProvidersQuery } from '../../../../store';
import { ReducedProvider } from '../../../../store/types';
import { EmptyRow, LoadingRow, Pagination, Table, usePagination } from '../../../components/table';

const Row = (provider: ReducedProvider): JSX.Element => (
  <tr>
    <Table.Data index>{provider.name}</Table.Data>
    <Table.Data>{provider.slug}</Table.Data>
    <Table.Data>
      <img className="h-5" aria-hidden="true" alt={`${provider.name} logo`} src={provider.icon} />
    </Table.Data>
    <Table.Data>
      <Badge color={provider.enabled ? 'green' : 'red'}>{provider.enabled ? 'Yes' : 'No'}</Badge>
    </Table.Data>
    <Table.Data className="relative text-right sm:pr-6">
      <Link to={`/providers/${provider.slug}`} className="text-indigo-600 hover:text-indigo-900">
        Details
      </Link>
    </Table.Data>
  </tr>
);

const List = (): JSX.Element => {
  const { data: providers = [], isLoading } = useListProvidersQuery();
  const { paginated, ...paginationProps } = usePagination(providers);

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700">Manage OpenID Connect / OAuth2 providers for login.</p>
        </div>
      </div>

      <div className="mt-2 flex justify-end">
        <LinkButton size="sm" to="/providers/new">
          <PlusIcon className="h-4 w-4 mr-2" />
          New
        </LinkButton>
      </div>

      <Table className="mt-2">
        <Table.Head>
          <Table.Label index>Name</Table.Label>
          <Table.Label>Slug</Table.Label>
          <Table.Label>Logo</Table.Label>
          <Table.Label>Enabled</Table.Label>
          <Table.InvisibleLabel>View</Table.InvisibleLabel>
        </Table.Head>
        <Table.Body>
          {isLoading && <LoadingRow />}
          {!isLoading && paginated.length === 0 && (
            <EmptyRow
              message="No providers yet"
              callToAction={
                <LinkButton to="/providers/new">
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" /> New provider
                </LinkButton>
              }
            />
          )}
          {paginated.map((p) => (
            <Row key={p.slug} {...p} />
          ))}
        </Table.Body>
      </Table>

      <Pagination {...paginationProps} />
    </>
  );
};

export default List;
