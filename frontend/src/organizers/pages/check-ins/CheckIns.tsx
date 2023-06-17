import React from 'react';

import List from './List';
import Statistics from './Statistics';

const CheckIns = (): JSX.Element => (
  <>
    <div className="sm:flex sm:items-center">
      <div className="sm:flex-auto">
        <p className="mt-2 text-sm text-gray-700">View the participant&apos;s that have checked-in to the event</p>
      </div>
    </div>

    <Statistics />
    <List />
  </>
);

export default CheckIns;
