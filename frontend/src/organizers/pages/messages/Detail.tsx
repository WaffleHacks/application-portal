import { ArrowLeftIcon, PaperAirplaneIcon, PencilIcon, RefreshIcon, TrashIcon } from '@heroicons/react/outline';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Alert from '../../../components/Alert';
import Badge from '../../../components/Badge';
import { Button, LinkButton } from '../../../components/buttons';
import { BaseCodeEditor } from '../../../components/input';
import { useDeleteMessageMutation, useGetMessageQuery, useSendMessageMutation } from '../../../store';
import { Description, Item, Section } from '../../components/description';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';

const Detail = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetMessageQuery(id as string);

  const [deleteMessage, { isLoading: isDeleteLoading, isSuccess }] = useDeleteMessageMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [send, { isLoading: isSendLoading }] = useSendMessageMutation();
  const [sendOpen, setSendOpen] = useState(true);

  useEffect(() => {
    if (!isDeleteLoading && isSuccess) navigate('/messages');
  }, [isDeleteLoading, isSuccess]);

  if (isLoading) return <Loading />;
  if (data === undefined) return <NotFound message="We couldn't find that message" returnTo="/messages" />;

  const actions = (
    <span className="relative z-0 inline-flex shadow-sm rounded-md">
      <Button
        type="button"
        style="white"
        rounded="none"
        className="relative rounded-l-md border-gray-200"
        onClick={() => setSendOpen(true)}
        disabled={isSendLoading}
      >
        {isSendLoading ? (
          <RefreshIcon className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
        ) : (
          <PaperAirplaneIcon className="h-4 w-4 mr-2" aria-hidden="true" />
        )}
        Send
      </Button>
      <LinkButton
        to={`/messages/${id}/edit`}
        style="white"
        rounded="none"
        className="-ml-px relative rounded-r-md border-gray-200"
      >
        Edit
        <PencilIcon className="h-4 w-4 ml-2" aria-hidden="true" />
      </LinkButton>
    </span>
  );

  return (
    <>
      <Alert
        isOpen={deleteOpen}
        close={() => setDeleteOpen(false)}
        onClick={() => deleteMessage(parseInt(id as string))}
        title="Delete this message?"
        description="Are you sure you want to delete this message? All of the data will be permanently removed. This will not stop erroneously sent messages from being sent. This action cannot be undone."
      />
      <Alert
        isOpen={sendOpen}
        close={() => setSendOpen(false)}
        onClick={() => send(parseInt(id as string))}
        title="Send this message?"
        description="Are you sure you want to send this message? This action is irreversible and cannot be cancelled."
        style="warning"
      />

      <Description
        title={data.subject}
        titleLeft={actions}
        subtitle={`Last updated: ${DateTime.fromISO(data.created_at).toLocaleString(DateTime.DATETIME_SHORT)}`}
      >
        <Section>
          <Item name="Status">
            <Badge color={data.sent ? 'red' : 'yellow'}>{data.sent ? 'Sent' : 'Draft'}</Badge>
          </Item>
          <Item name="Recipients">
            {data.recipients.map((r) => (
              <Badge key={r.group} className="mr-2.5">
                {r.group}
              </Badge>
            ))}
          </Item>
        </Section>
        <Section>
          <Item name="Content" wide={true}>
            <BaseCodeEditor id="content" value={data.content} disabled={true} />
          </Item>
        </Section>
      </Description>

      <div className="mt-3 flex justify-between">
        <LinkButton to="/messages">
          <ArrowLeftIcon className="h-4 w-5 mr-2" />
          Back
        </LinkButton>

        <Button type="button" style="danger" onClick={() => setDeleteOpen(true)}>
          <TrashIcon className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </>
  );
};

export default Detail;
