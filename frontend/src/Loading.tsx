import { RefreshIcon } from '@heroicons/react/outline';
import React from 'react';

const Loading = (): JSX.Element => (
  <div className="h-screen flex">
    <div className="m-auto">
      <div className="flex justify-center">
        <RefreshIcon className="w-16 h-16 rounded-full animate-spin" />
      </div>
      <p className="text-gray-700 text-center mt-5">Loading copious amounts of JavaScript...</p>
    </div>
  </div>
);

export default Loading;
