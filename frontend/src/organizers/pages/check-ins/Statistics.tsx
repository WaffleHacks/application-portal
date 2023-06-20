import React from 'react';

import Counts from 'organizers/components/Counts';
import Loading from 'organizers/components/Loading';
import { useGetCheckInStatisticsQuery } from 'store';

const Statistics = (): JSX.Element => {
  const { data, isLoading } = useGetCheckInStatisticsQuery();

  if (isLoading || data === undefined) return <Loading />;

  return (
    <Counts
      className="mt-5 sm:grid-cols-2"
      counts={[
        { label: 'Checked-in', count: data.yes },
        { label: 'Not checked-in', count: data.no },
      ]}
    />
  );
};

export default Statistics;
