import { ArrowLeftIcon, PaperAirplaneIcon, PencilIcon } from '@heroicons/react/outline';
import { DateTime } from 'luxon';
import React from 'react';
import { useParams } from 'react-router-dom';

import Badge from '../../../components/Badge';
import { Button, LinkButton } from '../../../components/buttons';
import { BaseCodeEditor } from '../../../components/input';
import { useGetMessageQuery } from '../../../store';
import { Description, Item, Section } from '../../components/description';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';

const Detail = (): JSX.Element => {
  const { id } = useParams();
  const { data, isLoading } = useGetMessageQuery(id as string);

  if (isLoading) return <Loading />;
  if (data === undefined) return <NotFound message="We couldn't find that message" returnTo="/messages" />;

  const actions = (
    <span className="relative z-0 inline-flex shadow-sm rounded-md">
      {/* TODO: actually send stuff */}
      <Button type="button" style="white" rounded="none" className="relative rounded-l-md border-gray-200">
        <PaperAirplaneIcon className="h-4 w-4 mr-2" aria-hidden="true" />
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

      <div className="mt-3">
        <LinkButton to="/messages">
          <ArrowLeftIcon className="h-4 w-5 mr-2" />
          Back
        </LinkButton>
      </div>
    </>
  );
};

export default Detail;
