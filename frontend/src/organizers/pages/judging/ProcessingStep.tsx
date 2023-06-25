import { ArrowPathIcon } from '@heroicons/react/24/outline';
import React, { useEffect } from 'react';

import Card from 'components/Card';
import { useGetJudgingDataProcessingStatusQuery } from 'store';

interface Props {
  file: string;
  next: () => void;
}

const ProcessingStep = ({ file, next }: Props): JSX.Element => {
  const { data } = useGetJudgingDataProcessingStatusQuery(file, { pollingInterval: 500 });

  useEffect(() => {
    if (data === undefined) return;
    if (data.status !== 'pending') {
      console.log('next');
      next();
    }
  }, [data]);

  return (
    <Card>
      <h3 className="text-lg font-semibold leading-8 text-gray-700">Processing...</h3>
      <div className="mt-3 pt-12 pb-6 text-center">
        <ArrowPathIcon className="mx-auto h-12 w-12 animate-spin" aria-hidden="true" />
        <span className="sr-only">Processing...</span>
      </div>
    </Card>
  );
};

export default ProcessingStep;
