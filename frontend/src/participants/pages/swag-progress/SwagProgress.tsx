import { ArrowUpIcon } from '@heroicons/react/outline';
import React, { useEffect, useState } from 'react';

import Card from '../../../components/Card';
import RenderMarkdown from '../../../components/RenderMarkdown';
import { useGetSwagProgressQuery } from '../../../store';
import Loading from '../../components/Loading';
import ProgressBar from './ProgressBar';

const SwagProgress = (): JSX.Element => {
  const { data, isLoading } = useGetSwagProgressQuery();
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!isLoading && data !== undefined) setSelected(data.current_tier || data.tiers[data.tiers.length - 1].id);
  }, [isLoading, data]);

  if (isLoading || data === undefined) return <Loading />;

  const current = data.tiers.find((t) => t.id === selected) || data.tiers[data.tiers.length - 1];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-flow-col-dense lg:grid-cols-3">
      <div className="lg:col-start-1">
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
      </div>
      <div className="lg:col-start-2 lg:col-span-2">
        <Card>
          <h1 className="text-3xl font-bold">{current.name}</h1>
          <RenderMarkdown content={current.description} />
        </Card>
      </div>
    </div>
  );
};

export default SwagProgress;
