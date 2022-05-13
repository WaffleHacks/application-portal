import { PlusIcon } from '@heroicons/react/outline';
import { DateTime } from 'luxon';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { LinkButton } from '../../../components/buttons';
import {
  ReducedMessage,
  useListMessageTriggersQuery,
  useListMessagesQuery,
  useSetMessageTriggerMutation,
} from '../../../store';
import { MessageTrigger } from '../../../store/types';
import { EmptyRow, LoadingRow, Pagination, Table } from '../../components/table';

const MessageRow = (message: ReducedMessage): JSX.Element => {
  const lastUpdated = DateTime.fromISO(message.updated_at);
  const formattedLastUpdated =
    lastUpdated.diffNow().negate().as('days') > 1
      ? lastUpdated.toLocaleString(DateTime.DATETIME_SHORT)
      : lastUpdated.toRelative();

  return (
    <tr>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{message.subject}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{message.sent ? 'yes' : 'no'}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formattedLastUpdated}</td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <Link to={`/messages/${message.id}`} className="text-indigo-600 hover:text-indigo-900">
          Details
        </Link>
      </td>
    </tr>
  );
};

interface MessageSelectProps {
  id: number | null;
  setId: (v: number | null) => void;
}

const MessageSelect = ({ id, setId }: MessageSelectProps): JSX.Element => {
  const { data = [], isLoading } = useListMessagesQuery();

  const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
    try {
      setId(parseInt(e.target.value));
    } catch (_) {
      setId(null);
    }
  };

  return (
    <div>
      <select
        name="message-select"
        className="mt-1 block w-full pl-3 pr-10 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        value={id ? id : 'null'}
        onChange={onChange}
      >
        {isLoading && <option disabled>Loading...</option>}
        {!isLoading && (
          <>
            <option value="null">N/A</option>
            {data.map((m) => (
              <option key={m.id} value={m.id} defaultChecked={m.id === id}>
                {m.subject}
              </option>
            ))}
          </>
        )}
      </select>
    </div>
  );
};

const TriggerRow = (trigger: MessageTrigger): JSX.Element => {
  const [isEditing, setEditing] = useState(false);
  const [newId, setNewId] = useState(trigger.message ? trigger.message.id : null);

  const [update, { isLoading }] = useSetMessageTriggerMutation();

  // Disable editing once loading is finished
  useEffect(() => {
    if (!isLoading) setEditing(false);
  }, [isLoading]);

  // Initiate saving or enable editing
  const toggleEditing = () => {
    if (isEditing) update({ type: trigger.trigger, message_id: newId });
    else setEditing(true);
  };

  // Reset value and disable editing
  const onCancel = () => {
    setNewId(trigger.message ? trigger.message.id : null);
    setEditing(false);
  };

  return (
    <tr>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{trigger.trigger}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {isEditing && <MessageSelect id={newId} setId={setNewId} />}
        {!isEditing && (trigger.message ? trigger.message.subject : 'N/A')}
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <button
          type="button"
          onClick={toggleEditing}
          className="rounded-md font-bold text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isLoading ? 'Loading...' : isEditing ? 'Save' : 'Edit'}
        </button>
        {isEditing && !isLoading && (
          <>
            <span className="text-gray-500 font-bold mx-1" aria-hidden="true">
              |
            </span>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md font-bold text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          </>
        )}
      </td>
    </tr>
  );
};

const List = (): JSX.Element => {
  const [page, setPage] = useState(0);
  const { data: messages = [], isLoading: isMessagesLoading } = useListMessagesQuery();
  const { data: triggers = [], isLoading: isTriggersLoading } = useListMessageTriggersQuery();

  const maxPage = Math.floor(messages.length / 20);
  const paginated = messages.slice(20 * page, 20 + 20 * page);

  const orderedTriggers = triggers.slice().sort((a, b) => {
    if (a.trigger === b.trigger) return 0;
    else if (a.trigger > b.trigger) return 1;
    else return -1;
  });

  return (
    <>
      <div>
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <p className="mt-2 text-sm text-gray-700">Draft and send messages to participants.</p>
          </div>
        </div>

        <div className="mt-2 flex justify-end">
          <LinkButton size="sm" to="/messages/new">
            <PlusIcon className="h-4 w-4 mr-2" />
            New
          </LinkButton>
        </div>

        <Table className="mt-2">
          <Table.Head>
            <th
              scope="col"
              className="text-left text-sm font-semibold text-gray-500 uppercase py-3.5 pl-4 pr-3 sm:pl-6"
            >
              Subject
            </th>
            <th scope="col" className="text-left text-sm font-semibold text-gray-500 uppercase py-3.5 px-3">
              Sent
            </th>
            <th scope="col" className="text-left text-sm font-semibold text-gray-500 uppercase py-3.5 px-3">
              Last Updated
            </th>
            <th scope="col" className="relative py-3 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">View</span>
            </th>
          </Table.Head>
          <Table.Body>
            {isMessagesLoading && <LoadingRow />}
            {!isMessagesLoading && paginated.length === 0 && (
              <EmptyRow
                message="No messages yet, get started by creating one."
                callToAction={
                  <Link
                    to="/messages/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    New message
                  </Link>
                }
              />
            )}
            {!isMessagesLoading && paginated.map((m) => <MessageRow key={m.id} {...m} />)}
          </Table.Body>
        </Table>

        <Pagination page={page} setPage={setPage} max={maxPage} />
      </div>

      <div className="mt-12">
        <h3 className="text-lg font-bold">Automated triggers</h3>
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <p className="text-sm text-gray-700">
              Select messages to be sent automatically based on participant actions.
            </p>
          </div>
        </div>

        <Table>
          <Table.Head>
            <th
              scope="col"
              className="text-left text-sm font-semibold text-gray-500 uppercase py-3.5 pl-4 pr-3 sm:pl-6"
            >
              Trigger
            </th>
            <th scope="col" className="text-left text-sm font-semibold text-gray-500 uppercase py-3.5 px-3">
              Message
            </th>
            <th scope="col" className="relative py-3 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Edit</span>
            </th>
          </Table.Head>
          <Table.Body>
            {isTriggersLoading && <LoadingRow />}
            {!isTriggersLoading && orderedTriggers.length === 0 && (
              <EmptyRow message="No automated message triggers. Was the database seeded properly?" />
            )}
            {!isTriggersLoading && orderedTriggers.map((t) => <TriggerRow key={t.trigger} {...t} />)}
          </Table.Body>
        </Table>
      </div>
    </>
  );
};

export default List;
