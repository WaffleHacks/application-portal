import { ArrowPathIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';

import Counts from 'organizers/components/Counts';
import { useGetParticipantCountsByStatusQuery } from 'store';

import { IconWithLabel } from './ChartContainer';

const ParticipantCounts = (): JSX.Element => {
  const { data, isLoading } = useGetParticipantCountsByStatusQuery();

  if (isLoading) return <IconWithLabel text="Loading..." className="animate-spin" icon={ArrowPathIcon} />;
  else if (data === undefined) return <IconWithLabel text="No data" icon={QuestionMarkCircleIcon} />;

  return (
    <Counts
      className="mt-5 sm:grid-cols-3"
      counts={[
        { label: 'Accepted', count: data.accepted },
        { label: 'Pending', count: data.pending },
        { label: 'Rejected', count: data.rejected },
      ]}
    />
  );
};

export default ParticipantCounts;
