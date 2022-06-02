import { ArrowLeftIcon } from '@heroicons/react/outline';
import React from 'react';
import { useParams } from 'react-router-dom';

import Badge from '../../../components/Badge';
import { LinkButton } from '../../../components/buttons';
import { useGetDetailedEventFeedbackQuery } from '../../../store';
import { Description, Item, Section } from '../../components/description';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';

interface ScoreBadgeProps {
  value: number;
}

const ScoreBadge = ({ value }: ScoreBadgeProps): JSX.Element => {
  if (value >= 7) return <Badge color="green">{value} / 10</Badge>;
  else if (value >= 5) return <Badge color="yellow">{value} / 10</Badge>;
  else return <Badge color="red">{value} / 10</Badge>;
};

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
            <ScoreBadge value={data.presentation} />
          </Item>
          <Item name="Content">
            <ScoreBadge value={data.content} />
          </Item>
          <Item name="Engagement">
            <ScoreBadge value={data.interest} />
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
