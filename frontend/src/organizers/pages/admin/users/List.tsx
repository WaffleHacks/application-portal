import React from 'react';

import Badge, { Color } from 'components/Badge';
import Link from 'components/Link';
import { EmptyRow, LoadingRow, Pagination, Table, usePagination } from 'organizers/components/table';
import { Participant, useListParticipantsQuery } from 'store';
import { Role } from 'store/types';

const Row = (participant: Participant): JSX.Element => (
  <tr>
    <Table.Data index>
      {participant.first_name} {participant.last_name}
    </Table.Data>
    <Table.Data>{participant.email}</Table.Data>
    <Table.Data>
      <Badge color={roleColor(participant.role)}>{participant.role}</Badge>
    </Table.Data>
    <Table.Data>
      <Badge color={participant.is_admin ? 'green' : 'red'}>{participant.is_admin ? 'Yes' : 'No'}</Badge>
    </Table.Data>
    <Table.Data className="relative text-right sm:pr-6">
      <Link to={`/users/${participant.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
        Change permissions
      </Link>
    </Table.Data>
  </tr>
);

const roleColor = (role: Role): Color => {
  switch (role) {
    case Role.Participant:
      return 'gray';
    case Role.Sponsor:
      return 'blue';
    case Role.Organizer:
      return 'purple';
    default:
      throw new Error(`unknown role: ${role}`);
  }
};

const List = (): JSX.Element => {
  const { data: users = [], isLoading } = useListParticipantsQuery();
  const { paginated, ...paginationProps } = usePagination(users);

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700">Manage user permissions.</p>
        </div>
      </div>

      <Table className="mt-2">
        <Table.Head>
          <Table.Label index>Name</Table.Label>
          <Table.Label>Email</Table.Label>
          <Table.Label>Role</Table.Label>
          <Table.Label>Admin?</Table.Label>
          <Table.InvisibleLabel>View</Table.InvisibleLabel>
        </Table.Head>
        <Table.Body>
          {isLoading && <LoadingRow />}
          {!isLoading && paginated.length === 0 && <EmptyRow message="No users yet" />}
          {paginated.map((p) => (
            <Row key={p.id} {...p} />
          ))}
        </Table.Body>
      </Table>

      <Pagination {...paginationProps} />
    </>
  );
};

export default List;
