import { ArrowLeftIcon } from '@heroicons/react/outline';
import { DateTime } from 'luxon';
import React from 'react';
import { Link, useParams } from 'react-router-dom';

import Badge from '../../../components/Badge';
import { useGetMessageQuery } from '../../../store';
import { Description, Item, Section } from '../../components/description';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import Editor from './Editor';

const Detail = (): JSX.Element => {
  const { id } = useParams();
  const { data, isLoading } = useGetMessageQuery(id as string);

  if (isLoading) return <Loading />;
  if (data === undefined) return <NotFound message="We couldn't find that message" returnTo="/messages" />;

  return (
    <>
      <Description
        title={data.subject}
        // TODO: add send button w/ confirmation
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
            <Editor value={data.content} editable={false} />
          </Item>
        </Section>
      </Description>

      <div className="mt-3">
        <Link
          to="/messages"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeftIcon className="h-4 w-5 mr-2" />
          Back
        </Link>
      </div>
    </>
  );
};

export default Detail;
