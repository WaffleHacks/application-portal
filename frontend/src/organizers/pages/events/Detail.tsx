import { ArrowLeftIcon, ClipboardCopyIcon, PencilIcon, TrashIcon } from '@heroicons/react/outline';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

import Badge from '../../../components/Badge';
import { Button, LinkButton } from '../../../components/buttons';
import Confirm from '../../../components/Confirm';
import Link from '../../../components/Link';
import Loading from '../../../Loading';
import { useDeleteEventMutation, useGetEventQuery } from '../../../store';
import { Participant, ReducedFeedback } from '../../../store/types';
import { Description, Item, Section } from '../../components/description';
import NotFound from '../../components/NotFound';
import { EmptyRow, InlineTable, Pagination, Table, usePagination } from '../../components/table';
import Stars from './Stars';

interface WithMessageId {
  id: string;
}

const DeleteButton = ({ id }: WithMessageId): JSX.Element => {
  const navigate = useNavigate();

  const [deleteMessage, { isLoading, isSuccess }] = useDeleteEventMutation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && isSuccess) navigate('/events');
  }, [isLoading, isSuccess]);

  return (
    <>
      <Confirm
        isOpen={open}
        close={() => setOpen(false)}
        onClick={() => deleteMessage(parseInt(id))}
        title="Delete this event?"
        description="Are you sure you want to delete this event? All of the data will be permanently removed. This action cannot be undone."
      />

      <Button type="button" style="danger" onClick={() => setOpen(true)}>
        <TrashIcon className="h-4 w-4 mr-2" />
        Delete
      </Button>
    </>
  );
};

const ParticipantRow = (participant: Participant): JSX.Element => (
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

interface FeedbackProps extends ReducedFeedback {
  eventId: string;
}

const FeedbackRow = (feedback: FeedbackProps): JSX.Element => (
  <tr>
    <Table.Data index>
      <Link to={`/applications/${feedback.participant.id}`}>
        {feedback.participant.first_name} {feedback.participant.last_name}
      </Link>
    </Table.Data>
    <Table.Data>
      <Stars value={feedback.presentation} />
    </Table.Data>
    <Table.Data>
      <Stars value={feedback.content} />
    </Table.Data>
    <Table.Data>
      <Stars value={feedback.interest} />
    </Table.Data>
    <Table.Data>
      <Link to={`/events/${feedback.eventId}/feedback/${feedback.participant.id}`}>Details</Link>
    </Table.Data>
  </tr>
);

const Detail = (): JSX.Element => {
  const { id } = useParams();
  const { data, isLoading } = useGetEventQuery(id as string);

  const { paginated: paginatedAttendees, ...attendeePaginatedProps } = usePagination(data?.attendees || [], 5);
  const { paginated: paginatedFeedback, ...feedbackPaginatedProps } = usePagination(data?.feedback || [], 5);

  if (isLoading) return <Loading />;
  if (data === undefined) return <NotFound message="We couldn't find that event" returnTo="/events" />;

  const onCopy = async () => {
    await navigator.clipboard.writeText(`${window.origin}/workshop/${data.code}`);
    toast.success('Attendance URL copied to clipboard!');
  };

  const validFrom = DateTime.fromISO(data.valid_from).toLocaleString(DateTime.DATETIME_MED);
  const validUntil = DateTime.fromISO(data.valid_until).toLocaleString(DateTime.DATETIME_MED);

  return (
    <>
      <Description
        title={data.name}
        titleLeft={
          <LinkButton to={`/events/${id}/edit`} style="white">
            Edit <PencilIcon className="h-4 w-4 ml-2" aria-hidden="true" />
          </LinkButton>
        }
        subtitle="View all the details of the event"
      >
        <Section>
          <Item name="Code">
            <span>{data.code}</span>
            <button type="button" onClick={onCopy}>
              <ClipboardCopyIcon className="ml-2 h-4 w-4 text-gray-700 hover:text-indigo-600" />
            </button>
          </Item>
          <Item name="Valid from">{validFrom}</Item>
          <Item name="Valid until">{validUntil}</Item>
          <Item name="Enabled">
            <Badge color={data.enabled ? 'green' : 'red'}>{data.enabled ? 'Yes' : 'No'}</Badge>
          </Item>
        </Section>
      </Description>

      <Description title="Attendance">
        <div className="ml-8 mb-4">
          <p className="text-sm font-medium text-gray-500">Total</p>
          <p className="mt-1 text-sm text-gray-900">
            {data.attendees.length} participant{data.attendees.length === 1 ? '' : 's'}
          </p>
        </div>
        <InlineTable className="mx-4">
          <Table.Head className="bg-white">
            <Table.Label index>Name</Table.Label>
            <Table.Label>Email</Table.Label>
            <Table.InvisibleLabel>Detail</Table.InvisibleLabel>
          </Table.Head>
          <Table.Body>
            {paginatedAttendees.length === 0 && <EmptyRow message="No attendees yet" />}
            {paginatedAttendees.map((p) => (
              <ParticipantRow key={p.id} {...p} />
            ))}
          </Table.Body>
        </InlineTable>
        <div className="mx-4 my-4">
          <Pagination {...attendeePaginatedProps} />
        </div>
      </Description>

      <Description title="Feedback">
        <InlineTable className="mx-4">
          <Table.Head className="bg-white">
            <Table.Label index>From</Table.Label>
            <Table.Label>Presentation</Table.Label>
            <Table.Label>Content</Table.Label>
            <Table.Label>Engagement</Table.Label>
            <Table.InvisibleLabel>Detail</Table.InvisibleLabel>
          </Table.Head>
          <Table.Body>
            {paginatedFeedback.length === 0 && <EmptyRow message="No feedback yet" />}
            {paginatedFeedback.map((f) => (
              <FeedbackRow key={f.participant.id} eventId={id as string} {...f} />
            ))}
          </Table.Body>
        </InlineTable>
        <div className="mx-4 my-4">
          <Pagination {...feedbackPaginatedProps} />
        </div>
      </Description>

      <div className="mt-3 flex justify-between">
        <LinkButton to="/events">
          <ArrowLeftIcon className="h-4 w-5 mr-2" />
          Back
        </LinkButton>

        <DeleteButton id={id as string} />
      </div>
    </>
  );
};

export default Detail;
