import React from 'react';

import Link from '../../../components/Link';
import { useGetAllParticipantSwagProgressQuery } from '../../../store';
import { ParticipantWithSwag } from '../../../store/types';
import { EmptyRow, LoadingRow, Pagination, Table, usePagination } from '../../components/table';

const Row = (participant: ParticipantWithSwag): JSX.Element => (
  <tr>
    <Table.Data index>
      {participant.first_name} {participant.last_name}
    </Table.Data>
    <Table.Data>{participant.email}</Table.Data>
    <Table.Data>{participant.swag_tier ? participant.swag_tier.name : 'N/A'}</Table.Data>
    <Table.Data>
      <Link to={`/applications/${participant.id}`}>Details</Link>
    </Table.Data>
  </tr>
);

const Progress = (): JSX.Element => {
  const { data = [], isLoading } = useGetAllParticipantSwagProgressQuery();
  const { paginated, ...paginationProps } = usePagination(data);

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700">View all the current swag tiers for all accepted participants.</p>
        </div>
      </div>

      <Table>
        <Table.Head>
          <Table.Label index>Name</Table.Label>
          <Table.Label>Email</Table.Label>
          <Table.Label>Tier</Table.Label>
          <Table.InvisibleLabel>Details</Table.InvisibleLabel>
        </Table.Head>
        <Table.Body>
          {isLoading && <LoadingRow />}
          {!isLoading && paginated.length === 0 && <EmptyRow message="No accepted participants yet." />}
          {paginated.map((p) => (
            <Row key={p.id} {...p} />
          ))}
        </Table.Body>
      </Table>

      <Pagination {...paginationProps} />
    </>
  );
};

export default Progress;
