import { CheckIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import React from 'react';

interface StepProps {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

const Complete = ({ title, description, selected, onClick }: StepProps): JSX.Element => (
  <button type="button" onClick={onClick} className="text-left relative flex items-start group">
    <span className="h-9 flex items-center">
      <span
        className={classNames(
          'relative z-10 w-8 h-8 flex items-center justify-center rounded-full',
          selected
            ? 'bg-indigo-400 border-2 border-indigo-600'
            : 'bg-indigo-600 group-hover:bg-indigo-400 group-hover:border-2 group-hover:border-indigo-600',
        )}
      >
        <CheckIcon
          className={classNames('h-5 w-5', selected ? 'text-indigo-800' : 'text-white group-hover:text-indigo-800')}
          aria-hidden="true"
        />
      </span>
    </span>
    <span className="ml-4 min-w-0 flex flex-col">
      <span className="text-xs font-semibold tracking-wide uppercase">{title}</span>
      <span className="text-sm text-gray-500">{description}</span>
    </span>
  </button>
);

const Current = ({ title, description, selected, onClick }: StepProps): JSX.Element => (
  <button type="button" onClick={onClick} className="text-left relative flex items-start group" aria-current="step">
    <span className="h-9 flex items-center" aria-hidden="true">
      <span
        className={classNames(
          'relative z-10 w-8 h-8 flex items-center justify-center border-2 rounded-full border-indigo-600',
          selected ? 'bg-indigo-200' : 'bg-white group-hover:bg-indigo-200',
        )}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
      </span>
    </span>
    <span className="ml-4 min-w-0 flex flex-col">
      <span className="text-xs font-semibold tracking-wide uppercase text-indigo-600">{title}</span>
      <span className="text-sm text-gray-500">{description}</span>
    </span>
  </button>
);

const Upcoming = ({ title, description, selected, onClick }: StepProps): JSX.Element => (
  <button type="button" onClick={onClick} className="text-left relative flex items-start group">
    <span className="h-9 flex items-center" aria-hidden="true">
      <span
        className={classNames(
          'relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 rounded-full',
          selected
            ? 'border-gray-400 bg-indigo-50'
            : 'border-gray-300 group-hover:border-gray-400 group-hover:bg-indigo-50',
        )}
      >
        <span
          className={classNames(
            'h-2.5 w-2.5 bg-transparent rounded-full',
            selected ? 'bg-gray-300' : 'group-hover:bg-gray-300',
          )}
        />
      </span>
    </span>
    <span className="ml-4 min-w-0 flex flex-col">
      <span className="text-xs font-semibold tracking-wide uppercase text-gray-500">{title}</span>
      <span className="text-sm text-gray-500">{description}</span>
    </span>
  </button>
);

interface LineProps {
  solid?: boolean;
}

const Line = ({ solid = false }: LineProps): JSX.Element => (
  <div
    className={classNames('-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full', solid ? 'bg-indigo-600' : 'bg-gray-300')}
    aria-hidden="true"
  />
);

interface Step {
  id: number;
  title: string;
  required: number;
}

interface Props {
  steps: Step[];
  progress: number;
  selected?: number;
  onSelect?: (id: number) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
const ProgressBar = ({ progress, steps, selected, onSelect = noop }: Props): JSX.Element => (
  <nav aria-label="Progress">
    <ol role="list" className="overflow-hidden">
      {steps.map((step, index) => (
        <li key={index} className={classNames('relative', { 'pb-10': index !== steps.length - 1 })}>
          {index !== steps.length - 1 && <Line solid={progress >= steps[index + 1]?.required} />}
          {progress >= step.required ? (
            <Complete
              title={step.title}
              description="It's all yours!"
              selected={selected === step.id}
              onClick={() => onSelect(step.id)}
            />
          ) : progress < step.required && progress >= steps[index + 1]?.required ? (
            <Current
              title={step.title}
              description={`${step.required - progress} more workshop${
                step.required - progress === 1 ? '' : 's'
              } needed!`}
              selected={selected === step.id}
              onClick={() => onSelect(step.id)}
            />
          ) : (
            <Upcoming
              title={step.title}
              description={`${progress}/${step.required} workshops`}
              selected={selected === step.id}
              onClick={() => onSelect(step.id)}
            />
          )}
        </li>
      ))}
    </ol>
  </nav>
);

export default ProgressBar;
