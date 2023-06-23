import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

import Badge from 'components/Badge';
import { Button, LinkButton } from 'components/buttons';
import Confirm from 'components/Confirm';
import RenderMarkdown from 'components/RenderMarkdown';
import { Description, Item, Section } from 'organizers/components/description';
import Loading from 'organizers/components/Loading';
import NotFound from 'organizers/components/NotFound';
import { useDeleteEventMutation, useGetEventQuery } from 'store';

import Attendance from './Attendance';
import Feedback from './Feedback';

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

const Detail = (): JSX.Element => {
  const { id } = useParams();
  const { data, isLoading } = useGetEventQuery(id as string);

  if (isLoading) return <Loading />;
  if (data === undefined) return <NotFound message="We couldn't find that event" returnTo="/events" />;

  const onCopyAttendance = async () => {
    await navigator.clipboard.writeText(`${window.origin}/workshop/${data.code}`);
    toast.success('Attendance URL copied to clipboard!');
  };

  const onCopyFeedback = async () => {
    await navigator.clipboard.writeText(`${window.origin}/workshop/${data.code}/feedback`);
    toast.success('Feedback URL copied to clipboard!');
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
          <Item name="Attendance URL">
            {data.track_attendance ? (
              <Button type="button" size="xs" style="secondary" onClick={onCopyAttendance}>
                Copy
              </Button>
            ) : (
              <Badge color="red">Disabled</Badge>
            )}
          </Item>
          <Item name="Feedback URL">
            <Button type="button" size="xs" style="secondary" onClick={onCopyFeedback}>
              Copy
            </Button>
          </Item>
        </Section>
        <Section>
          <Item name="Code">{data.code}</Item>
          <Item name="URL">
            {data.link ? (
              <a href={data.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                {data.link}
              </a>
            ) : (
              'N/A'
            )}
          </Item>
          <Item name="Enabled">
            <Badge color={data.enabled ? 'green' : 'red'}>{data.enabled ? 'Yes' : 'No'}</Badge>
          </Item>
        </Section>
        <Section>
          <Item name="Starts at">{validFrom}</Item>
          <Item name="Ends at">{validUntil}</Item>
          <Item name="Track Attendance?">
            <Badge color={data.track_attendance ? 'green' : 'red'}>{data.track_attendance ? 'Yes' : 'No'}</Badge>
          </Item>
        </Section>
        <Section>
          <Item name="Description" wide>
            {data.description ? <RenderMarkdown content={data.description} /> : 'N/A'}
          </Item>
        </Section>
      </Description>

      <Attendance attendees={data.attendees} />
      <Feedback feedback={data.feedback} />

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
