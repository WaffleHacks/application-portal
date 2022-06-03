import { ArrowUpIcon, RefreshIcon } from '@heroicons/react/outline';
import React, { useEffect, useState } from 'react';

import Card from '../../../components/Card';
import RenderMarkdown from '../../../components/RenderMarkdown';
import { useGetSwagProgressQuery } from '../../../store';
import ProgressBar from './ProgressBar';

const SwagProgress = (): JSX.Element => {
  const { data, isLoading } = useGetSwagProgressQuery();
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!isLoading && data !== undefined) setSelected(data.current_tier || data.tiers[data.tiers.length - 1].id);
  }, [isLoading, data]);

  if (isLoading || data === undefined) {
    return (
      <Card>
        <div className="mt-3 pt-12 pb-6 text-center">
          <RefreshIcon className="mx-auto h-12 w-12 animate-spin" />
        </div>
      </Card>
    );
  }

  const current = data.tiers.find((t) => t.id === selected) || data.tiers[data.tiers.length - 1];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-flow-col-dense lg:grid-cols-3">
      <Card>
        <ProgressBar
          steps={data.tiers.map((t) => ({ title: t.name, required: t.required_attendance, id: t.id }))}
          progress={data.attended}
          selected={selected}
          onSelect={setSelected}
        />
        <p className="mt-3 text-sm text-gray-400">
          <ArrowUpIcon className="h-4 w-4 ml-2 my-1" />
          Click on each tier to see their rewards!
        </p>
      </Card>
      <Card className="lg:col-span-2">
        <h1 className="text-3xl font-bold">{current.name}</h1>
        <RenderMarkdown content={current.description} />
      </Card>
    </div>
  );
};

export default SwagProgress;
