import { PlusIcon } from '@heroicons/react/outline';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { ReducedMessage, useListMessagesQuery } from '../../../store';
import { EmptyRow, LoadingRow, Pagination, Table } from '../../components/table';

const Row = (message: ReducedMessage): JSX.Element => {
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

const List = (): JSX.Element => {
  const [page, setPage] = useState(0);
  const { data: messages = [], isLoading: isMessagesLoading } = useListMessagesQuery();

  const maxPage = Math.floor(messages.length / 20);
  const paginated = messages.slice(20 * page, 20 + 20 * page);

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700">Draft and send messages to participants.</p>
        </div>
      </div>

      <Table>
        <Table.Head>
          <th scope="col" className="text-left text-sm font-semibold text-gray-500 uppercase py-3.5 pl-4 pr-3 sm:pl-6">
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
          {/* TODO: add empty state w/ call to action */}
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
          {!isMessagesLoading && paginated.map((m) => <Row key={m.id} {...m} />)}
        </Table.Body>
      </Table>

      <Pagination page={page} setPage={setPage} max={maxPage} />
    </>
  );
};

export default List;
