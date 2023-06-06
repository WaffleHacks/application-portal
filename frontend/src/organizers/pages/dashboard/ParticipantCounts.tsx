import { ArrowPathIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';

import { useGetParticipantCountsByStatusQuery } from 'store';

import { IconWithLabel } from './ChartContainer';

const ParticipantCounts = (): JSX.Element => {
  const { data, isLoading } = useGetParticipantCountsByStatusQuery();

  if (isLoading) return <IconWithLabel text="Loading..." icon={ArrowPathIcon} />;
  else if (data === undefined) return <IconWithLabel text="No data" icon={QuestionMarkCircleIcon} />;

  return (
    <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
      <Count label="Accepted" count={data.accepted} />
      <Count label="Pending" count={data.pending} />
      <Count label="Rejected" count={data.rejected} />
    </dl>
  );
};

interface CountProps {
  label: string;
  count: number;
}

const Count = ({ label, count }: CountProps): JSX.Element => (
  <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
    <dt className="truncate text-sm font-medium text-gray-500">{label} participants</dt>
    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{count}</dd>
  </div>
);

export default ParticipantCounts;
