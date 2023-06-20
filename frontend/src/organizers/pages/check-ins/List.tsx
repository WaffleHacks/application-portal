import React from 'react';

import Link from 'components/Link';
import { EmptyRow, LoadingRow, Pagination, Table, usePagination } from 'organizers/components/table';
import { Participant, useListCheckedInParticipantsQuery } from 'store';

const Row = (participant: Participant): JSX.Element => (
  <tr>
    <Table.Data index>
      {participant.first_name} {participant.last_name}
    </Table.Data>
    <Table.Data>{participant.email}</Table.Data>
    <Table.Data className="relative text-right sm:pr-6">
      <Link to={`/applications/${participant.id}`} className="text-indigo-600 hover:text-indigo-900">
        Details
      </Link>
    </Table.Data>
  </tr>
);

const List = (): JSX.Element => {
  const { data: checkedIn = [], isLoading } = useListCheckedInParticipantsQuery();
  const { paginated, ...paginationProps } = usePagination(checkedIn);

  return (
    <>
      <Table className="mt-4">
        <Table.Head>
          <Table.Label index>Name</Table.Label>
          <Table.Label>Email</Table.Label>
          <Table.InvisibleLabel>View</Table.InvisibleLabel>
        </Table.Head>
        <Table.Body>
          {isLoading && <LoadingRow />}
          {!isLoading && paginated.length === 0 && <EmptyRow message="No participant's have checked-in yet" />}
          {!isLoading && paginated.map((p) => <Row key={p.id} {...p} />)}
        </Table.Body>
      </Table>

      <Pagination {...paginationProps} />
    </>
  );
};

export default List;
