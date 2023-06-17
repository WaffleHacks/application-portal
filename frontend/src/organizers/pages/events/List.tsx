import { ClipboardDocumentIcon, PlusIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { toast } from 'react-hot-toast';

import Badge from 'components/Badge';
import { Button, LinkButton } from 'components/buttons';
import Link from 'components/Link';
import { EmptyRow, LoadingRow, Pagination, Table, usePagination } from 'organizers/components/table';
import { ReducedEvent, useListEventsQuery } from 'store';

const Row = (event: ReducedEvent) => {
  const onCopyAttendance = async () => {
    await navigator.clipboard.writeText(`${window.origin}/workshop/${event.code}`);
    toast.success('Attendance URL copied to clipboard!');
  };

  const onCopyFeedback = async () => {
    await navigator.clipboard.writeText(`${window.origin}/workshop/${event.code}/feedback`);
    toast.success('Feedback URL copied to clipboard!');
  };

  return (
    <tr>
      <Table.Data index>{event.name}</Table.Data>
      <Table.Data>{event.code}</Table.Data>
      <Table.Data>
        <Button type="button" size="xs" style="secondary" onClick={onCopyAttendance}>
          Attendance
          <ClipboardDocumentIcon className="ml-2 h-4 w-4 text-gray-700 hover:text-indigo-600" />
        </Button>
        <Button className="ml-2" type="button" size="xs" style="secondary" onClick={onCopyFeedback}>
          Feedback
          <ClipboardDocumentIcon className="ml-2 h-4 w-4 text-gray-700 hover:text-indigo-600" />
        </Button>
      </Table.Data>
      <Table.Data>
        <Badge color={event.enabled ? 'green' : 'red'}>{event.enabled ? 'Yes' : 'No'}</Badge>
      </Table.Data>
      <Table.Data className="relative text-right sm:pr-6">
        <Link to={`/events/${event.id}`} className="text-indigo-600 hover:text-indigo-900">
          Details
        </Link>
      </Table.Data>
    </tr>
  );
};

const List = (): JSX.Element => {
  const { data: events = [], isLoading } = useListEventsQuery();
  const { paginated, ...paginationProps } = usePagination(events);

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700">Manage events for tracking attendance and receiving feedback.</p>
        </div>
      </div>

      <div className="mt-2 flex justify-end">
        <LinkButton size="sm" to="/events/new">
          <PlusIcon className="h-4 w-4 mr-2" />
          New
        </LinkButton>
      </div>

      <Table className="mt-2">
        <Table.Head>
          <Table.Label index>Name</Table.Label>
          <Table.Label>Code</Table.Label>
          <Table.Label>URLs</Table.Label>
          <Table.Label>Enabled</Table.Label>
          <Table.InvisibleLabel>View</Table.InvisibleLabel>
        </Table.Head>
        <Table.Body>
          {isLoading && <LoadingRow />}
          {!isLoading && paginated.length === 0 && (
            <EmptyRow
              message="No events yet, get started by creating one."
              callToAction={
                <LinkButton to="/events/new">
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  New event
                </LinkButton>
              }
            />
          )}
          {!isLoading && paginated.map((e) => <Row key={e.id} {...e} />)}
        </Table.Body>
      </Table>

      <Pagination {...paginationProps} />
    </>
  );
};

export default List;
