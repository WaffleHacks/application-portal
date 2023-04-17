import {
  ArrowLeftIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  PencilIcon,
  RefreshIcon,
  TrashIcon,
} from '@heroicons/react/outline';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Alert from '../../../components/Alert';
import Badge from '../../../components/Badge';
import { Button, ButtonGroup, LinkButton } from '../../../components/buttons';
import Confirm from '../../../components/Confirm';
import { BaseCodeEditor } from '../../../components/input';
import {
  MessageStatus,
  useDeleteMessageMutation,
  useGetMessageQuery,
  useSendMessageMutation,
  useSendTestMessageMutation,
  useUpdateMessageMutation,
} from '../../../store';
import { Description, Item, Section } from '../../components/description';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import StatusBadge from './StatusBadge';

interface WithMessageId {
  id: string;
}

const DeleteButton = ({ id }: WithMessageId): JSX.Element => {
  const navigate = useNavigate();

  const [deleteMessage, { isLoading, isSuccess }] = useDeleteMessageMutation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && isSuccess) navigate('/messages');
  }, [isLoading, isSuccess]);

  return (
    <>
      <Confirm
        isOpen={open}
        close={() => setOpen(false)}
        onClick={() => deleteMessage(parseInt(id))}
        title="Delete this message?"
        description="Are you sure you want to delete this message? All of the data will be permanently removed. This will not stop erroneously sent messages from being sent. This action cannot be undone."
      />

      <Button type="button" style="danger" onClick={() => setOpen(true)}>
        <TrashIcon className="h-4 w-4 mr-2" />
        Delete
      </Button>
    </>
  );
};

interface SendButtonsProps extends WithMessageId {
  status: MessageStatus;
}

const SendButtons = ({ id, status }: SendButtonsProps): JSX.Element => {
  const [update, { isLoading: isUpdateLoading }] = useUpdateMessageMutation();
  const [send, { isLoading: isSendLoading, isSuccess: isSendSuccess }] = useSendMessageMutation();
  const [sendTest, { isLoading: isSendTestLoading, isSuccess: isSendTestSuccess }] = useSendTestMessageMutation();

  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [sendSuccessOpen, setSendSuccessOpen] = useState(false);

  const [sendTestSuccessOpen, setSendTestSuccessOpen] = useState(false);

  useEffect(() => {
    if (!isSendTestLoading && isSendTestSuccess) setSendTestSuccessOpen(true);
  }, [isSendTestLoading, isSendTestSuccess]);

  useEffect(() => {
    if (!isSendLoading && isSendSuccess) setSendSuccessOpen(true);
  }, [isSendLoading, isSendSuccess]);

  const isDraft = status === MessageStatus.Draft;
  const isSent = status === MessageStatus.Sent;

  return (
    <>
      <Alert
        isOpen={sendTestSuccessOpen}
        close={() => setSendTestSuccessOpen(false)}
        title="Test message sent!"
        description="A test message was successfully sent to your account's email. Please check that everything looks right before you send the message to everyone."
      />
      <Alert
        isOpen={sendSuccessOpen}
        close={() => setSendSuccessOpen(false)}
        title="Messages sent!"
        description="The message was successfully sent to all the recipients."
      />

      <Confirm
        isOpen={sendConfirmOpen}
        close={() => setSendConfirmOpen(false)}
        onClick={() => send(parseInt(id as string))}
        title={`Send this message${isSent ? ' again' : ''}?`}
        description={`Are you sure you want to send this message${
          isSent ? ' again' : ''
        }? This action is irreversible and cannot be cancelled.`}
        style="warning"
      />

      {isDraft ? (
        <ButtonGroup
          elements={[{ children: 'Send Test', disabled: isSendTestLoading, action: () => sendTest(parseInt(id)) }]}
          onClick={() => update({ id: parseInt(id), status: MessageStatus.Ready })}
          disabled={isUpdateLoading}
        >
          {isUpdateLoading ? (
            <RefreshIcon className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
          ) : (
            <CheckCircleIcon className="h-4 w-4 mr-2" aria-hidden="true" />
          )}
          Mark as ready
        </ButtonGroup>
      ) : (
        <ButtonGroup
          elements={[
            {
              children: 'Mark as draft',
              disabled: isUpdateLoading,
              action: () => update({ id: parseInt(id), status: MessageStatus.Draft }),
            },
            { children: 'Send Test', disabled: isSendTestLoading, action: () => sendTest(parseInt(id)) },
          ]}
          onClick={() => setSendConfirmOpen(true)}
          disabled={isSendLoading}
        >
          {isSendLoading ? (
            <RefreshIcon className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
          ) : (
            <PaperAirplaneIcon className="h-4 w-4 mr-2" aria-hidden="true" />
          )}
          Send
        </ButtonGroup>
      )}
    </>
  );
};

const Detail = (): JSX.Element => {
  const { id } = useParams();
  const { data, isLoading } = useGetMessageQuery(id as string);

  if (isLoading) return <Loading />;
  if (data === undefined) return <NotFound message="We couldn't find that message" returnTo="/messages" />;

  return (
    <>
      <Description
        title={data.subject}
        titleLeft={
          <div className="flex justify-around space-x-2">
            <SendButtons status={data.status} id={id as string} />
            <LinkButton to={`/messages/${id}/edit`} style="white">
              Edit
              <PencilIcon className="h-4 w-4 ml-2" aria-hidden="true" />
            </LinkButton>
          </div>
        }
        subtitle={`Last updated: ${DateTime.fromISO(data.created_at).toLocaleString(DateTime.DATETIME_SHORT)}`}
      >
        <Section>
          <Item name="Status">
            <StatusBadge status={data.status} />
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

        <DeleteButton id={id as string} />
      </div>
    </>
  );
};

export default Detail;
