import { ArrowUpIcon, DocumentIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

import Card from 'components/Card';
import RenderMarkdown from 'components/RenderMarkdown';
import Loading from 'participants/components/Loading';
import { useGetSwagProgressQuery } from 'store';

import ProgressBar from './ProgressBar';

const NoTiersConfigured = (): JSX.Element => (
  <Card className="text-center py-5">
    <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-md font-medium text-gray-900">
      No swag tiers have been setup just yet. Check back later!
    </h3>
  </Card>
);

const SwagProgress = (): JSX.Element => {
  const { data, isLoading } = useGetSwagProgressQuery();
  const [selected, setSelected] = useState<number>();

  useEffect(() => {
    if (isLoading || data === undefined) return;
    if (data.tiers.length === 0) return;

    setSelected(data.current_tier || data.tiers[data.tiers.length - 1].id);
  }, [isLoading, data]);

  if (isLoading || data === undefined) return <Loading />;
  if (selected === undefined) return <NoTiersConfigured />;

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
