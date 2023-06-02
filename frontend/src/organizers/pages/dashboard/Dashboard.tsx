import React from 'react';

import BarChart from './BarChart';
import ChartContainer from './ChartContainer';
import PieChart from './PieChart';
import RegistrationsPerDay from './RegistrationsPerDay';

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

      <RegistrationsPerDay />

      <div className="grid grid-cols-1 lg:grid-cols-2 justify-items-center mt-6 gap-y-8 gap-x-4">
        <ChartContainer title="Gender" source="gender" chart={PieChart} />
        <ChartContainer title="Race / Ethnicity" source="race-ethnicity" chart={PieChart} />
        <ChartContainer title="Past Hackathon Experience" source="experience" chart={PieChart} />
        <ChartContainer title="Level of Study" source="level-of-study" chart={PieChart} />
      </div>

      <ChartContainer className="mt-2" title="Age" source="age" chart={BarChart} width={1600} />
      <ChartContainer className="mt-2" title="Graduation Year" source="graduation-year" chart={BarChart} width={1600} />

      {/*
        TODO:
          - per day as line graph w/ range selector
          - countries as choropleth map
          - school as ?
          - major as ?
        */}
    </>
  );
};

export default Dashboard;
