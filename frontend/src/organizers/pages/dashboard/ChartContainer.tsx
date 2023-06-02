import { ArrowPathIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import React, { ComponentType } from 'react';

import { RegistrationStatistic, StatisticEntry, useGetRegistrationStatisticsQuery } from 'store';

export interface ChartProps {
  data: StatisticEntry[];
  width: number;
}

interface IconProps {
  className?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}

interface IconWithLabelProps {
  className?: string;
  text: string;
  icon: ComponentType<IconProps>;
}

export const IconWithLabel = ({ className, text, icon: Icon }: IconWithLabelProps): JSX.Element => (
  <>
    <div className="flex justify-center">
      <Icon className={classNames(className, 'w-16 h-16')} aria-hidden="true" />
    </div>
    <p className="text-center text-md text-gray-500">{text}</p>
  </>
);

interface ContainerProps {
  className?: string;
  title: string;
  source: RegistrationStatistic;
  width?: number;
  chart: ComponentType<ChartProps>;
}

const ChartContainer = ({ className, source, title, width = 400, chart: Chart }: ContainerProps): JSX.Element => {
  const { data = [], isLoading } = useGetRegistrationStatisticsQuery(source);

  let component;
  if (isLoading) component = <IconWithLabel text="Loading..." className="animate-spin" icon={ArrowPathIcon} />;
  else if (data.length === 0) component = <IconWithLabel text="No data yet" icon={QuestionMarkCircleIcon} />;
  else component = <Chart data={data} width={width} />;

  return (
    <div className={className}>
      <p className="w-full text-center mt-1 mb-3 text-xl text-gray-800">{title}</p>
      {component}
    </div>
  );
};

export default ChartContainer;
