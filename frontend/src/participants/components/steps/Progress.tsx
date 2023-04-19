import { CheckIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface StepProps {
  index: number;
  name: string;
  jump: () => void;
}

const Complete = ({ name, jump }: Pick<StepProps, 'name' | 'jump'>): JSX.Element => (
  <button type="button" className="group flex items-center w-full" onClick={jump}>
    <span className="px-6 py-4 flex items-center text-sm font-medium">
      <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-indigo-600 rounded-full group-hover:bg-indigo-800">
        <CheckIcon className="w-6 h-6 text-white" aria-hidden="true" />
      </span>
      <span className="ml-4 text-sm font-medium text-gray-900">{name}</span>
    </span>
  </button>
);

const Current = ({ index, name }: Pick<StepProps, 'name' | 'index'>): JSX.Element => (
  <button type="button" disabled className="px-6 py-4 flex items-center text-sm font-medium" aria-current="step">
    <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-indigo-600 rounded-full">
      <span className="text-indigo-600">{index + 1}</span>
    </span>
    <span className="ml-4 text-sm font-medium text-indigo-600">{name}</span>
  </button>
);

const Upcoming = ({ index, name }: Pick<StepProps, 'name' | 'index'>): JSX.Element => (
  <button type="button" disabled className="group flex items-center">
    <span className="px-6 py-4 flex items-center text-sm font-medium">
      <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-full">
        <span className="text-gray-500">{index + 1}</span>
      </span>
      <span className="ml-4 text-sm font-medium text-gray-500">{name}</span>
    </span>
  </button>
);

const Separator = (): JSX.Element => (
  <div className="hidden md:block absolute top-0 right-0 h-full w-5" aria-hidden="true">
    <svg className="h-full w-full text-gray-300" viewBox="0 0 22 80" fill="none" preserveAspectRatio="none">
      <path d="M0 -2L20 40L0 82" vectorEffect="non-scaling-stroke" stroke="currentcolor" strokeLinejoin="round" />
    </svg>
  </div>
);

interface Props {
  steps: string[];
  current: number;
  jump: (step: number) => void;
}

const Progress = ({ steps, current, jump }: Props): JSX.Element => (
  <nav aria-label="progress">
    <ol
      role="list"
      className="border border-gray-100 rounded-md divide-y divide-gray-300 md:flex md:divide-y-0 shadow-sm bg-white"
    >
      {steps.map((step, index) => (
        <li key={step} className="relative md:flex-1 md:flex">
          {index < current && <Complete name={step} jump={() => jump(index)} />}
          {index === current && <Current index={index} name={step} />}
          {index > current && <Upcoming index={index} name={step} />}
          {index !== steps.length - 1 && <Separator />}
        </li>
      ))}
    </ol>
  </nav>
);

export default Progress;
