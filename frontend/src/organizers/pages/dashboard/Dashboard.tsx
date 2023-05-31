import React from 'react';

import PieChart from './PieChart';

const Dashboard = (): JSX.Element => {
  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700">
            Aggregated statistics about all the participants who have applied.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 justify-items-center mt-6 gap-y-8 gap-x-4">
        <PieChart title="Gender" source="gender" />
        <PieChart title="Race / Ethnicity" source="race-ethnicity" />
        <PieChart title="Past Hackathon Experience" source="experience" />
        <PieChart title="Level of Study" source="level-of-study" />
      </div>

      {/*
        TODO:
          - per day as line graph w/ range selector
          - countries as choropleth map
          - age as bar chart
          - graduation year as bar chart
          - school as ?
          - major as ?
        */}
    </>
  );
};

export default Dashboard;
