import React from 'react';

import Link from 'components/Link';
import { Description } from 'organizers/components/description';
import { EmptyRow, InlineTable, Pagination, Table, usePagination } from 'organizers/components/table';
import { Participant } from 'store';

const Row = (participant: Participant): JSX.Element => (
  <tr>
    <Table.Data index>
      {participant.first_name} {participant.last_name}
    </Table.Data>
    <Table.Data>{participant.email}</Table.Data>
    <Table.Data>
      <Link to={`/applications/${participant.id}`}>Details</Link>
    </Table.Data>
  </tr>
);

interface Props {
  attendees: Participant[];
}

const Attendance = ({ attendees }: Props): JSX.Element => {
  const { paginated, ...paginationProps } = usePagination(attendees, 5);

  return (
    <Description title="Attendance">
      <div className="ml-8 mb-4">
        <p className="text-sm font-medium text-gray-500">Total</p>
        <p className="mt-1 text-sm text-gray-900">
          {attendees.length} participant{attendees.length === 1 ? '' : 's'}
        </p>
      </div>
      <InlineTable className="mx-4">
        <Table.Head className="bg-white">
          <Table.Label index>Name</Table.Label>
          <Table.Label>Email</Table.Label>
          <Table.InvisibleLabel>Detail</Table.InvisibleLabel>
        </Table.Head>
        <Table.Body>
          {paginated.length === 0 && <EmptyRow message="No attendees yet" />}
          {paginated.map((p) => (
            <Row key={p.id} {...p} />
          ))}
        </Table.Body>
      </InlineTable>
      <div className="mx-4 my-4 pb-4">
        <Pagination {...paginationProps} />
      </div>
    </Description>
  );
};

export default Attendance;
