import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useParams } from 'react-router-dom';

import Badge from 'components/Badge';
import { LinkButton } from 'components/buttons';
import { Description, Item, Section } from 'organizers/components/description';
import Loading from 'organizers/components/Loading';
import NotFound from 'organizers/components/NotFound';
import { useGetDetailedEventFeedbackQuery } from 'store';

import Stars from './Stars';

const Feedback = (): JSX.Element => {
  const { eventId, participantId } = useParams();
  const { data, isLoading } = useGetDetailedEventFeedbackQuery({
    event_id: eventId as string,
    participant_id: participantId as string,
  });

  if (isLoading) return <Loading />;
  if (data === undefined)
    return (
      <NotFound
        message="We couldn't find feedback from that participant for this event"
        returnTo={`/events/${eventId}`}
      />
    );

  return (
    <>
      <Description
        title={`${data.participant.first_name} ${data.participant.last_name}'s Feedback`}
        subtitle={`for ${data.event.name}`}
      >
        <Section>
          <Item name="Presentation">
            <Stars value={data.presentation} />
          </Item>
          <Item name="Content">
            <Stars value={data.content} />
          </Item>
          <Item name="Engagement">
            <Stars value={data.interest} />
          </Item>
          <Item name="Should we do it again?">
            <Badge color={data.again ? 'green' : 'red'}>{data.again ? 'Yes' : 'No'}</Badge>
          </Item>
        </Section>
        <Section>
          <Item name="Comments" wide={true}>
            {data.comments}
          </Item>
        </Section>
      </Description>

      <div className="mt-3">
        <LinkButton to={`/events/${eventId}`}>
          <ArrowLeftIcon className="h-4 w-5 mr-2" />
          Back
        </LinkButton>
      </div>
    </>
  );
};

export default Feedback;
