import { RefreshIcon } from '@heroicons/react/outline';
import React from 'react';

import Card from '../../components/Card';

const Loading = (): JSX.Element => (
  <Card>
    <div className="mt-3 pt-12 pb-6 text-center">
      <RefreshIcon className="mx-auto h-12 w-12 animate-spin" />
    </div>
  </Card>
);

export default Loading;
