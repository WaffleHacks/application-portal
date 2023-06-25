import { CheckIcon } from '@heroicons/react/24/solid';
import React from 'react';

const STEPS = ['Upload', 'Select Columns', 'Processing...', 'Download'];

interface Props {
  current: number;
}

const Steps = ({ current }: Props): JSX.Element => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0">
        {STEPS.map((name, i) => (
          <Step key={i} name={name} index={i} current={current} />
        ))}
      </ol>
    </nav>
  );
};

export default Steps;

interface StepProps {
  name: string;
  index: number;
  current: number;
}

const Step = ({ name, index, current }: StepProps): JSX.Element => (
  <li className="relative md:flex md:flex-1">
    {index < current && <CompleteStep name={name} />}
    {index === current && <CurrentStep index={index} name={name} />}
    {index > current && <UpcomingStep index={index} name={name} />}

    {index !== STEPS.length - 1 && (
      <div className="absolute right-0 top-0 hidden h-full w-5 md:block" aria-hidden="true">
        <svg className="h-full w-full text-gray-300" viewBox="0 0 22 80" fill="none" preserveAspectRatio="none">
          <path d="M0 -2L20 40L0 82" vectorEffect="non-scaling-stroke" stroke="currentColor" strokeLinejoin="round" />
        </svg>
      </div>
    )}
  </li>
);

const CompleteStep = ({ name }: Pick<StepProps, 'name'>): JSX.Element => (
  <div className="group flex w-full items-center">
    <span className="flex items-center px-6 py-4 text-sm font-medium">
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600">
        <CheckIcon className="h-6 w-6 text-white" aria-hidden="true" />
      </span>
      <span className="ml-4 text-sm font-medium text-gray-900">{name}</span>
    </span>
  </div>
);

const CurrentStep = ({ name, index }: Omit<StepProps, 'current'>): JSX.Element => (
  <div className="flex items-center px-6 py-4 text-sm font-medium" aria-current="step">
    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-indigo-600">
      <span className="text-indigo-600">{index + 1}</span>
    </span>
    <span className="ml-4 text-sm font-medium text-indigo-600">{name}</span>
  </div>
);

const UpcomingStep = ({ name, index }: Omit<StepProps, 'current'>): JSX.Element => (
  <div className="group flex items-center">
    <span className="flex items-center px-6 py-4 text-sm font-medium">
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300">
        <span className="text-gray-500">{index + 1}</span>
      </span>
      <span className="ml-4 text-sm font-medium text-gray-500">{name}</span>
    </span>
  </div>
);
