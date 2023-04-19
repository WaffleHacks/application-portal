import { RadioGroup } from '@headlessui/react';
import { StarIcon as EmptyStarIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { StarIcon as FilledStarIcon } from '@heroicons/react/24/solid';
import { useField } from 'formik';
import React from 'react';

import { BaseProps } from './common';

const Rating = ({ label, ...props }: BaseProps<number>): JSX.Element => {
  const [{ value }, { error }, { setValue }] = useField(props);
  const { className, required, disabled } = props;

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </h2>
        {error && <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />}
      </div>

      <RadioGroup
        value={value}
        onChange={(v: number) => setValue(v, true)}
        className="mt-2 max-w-xs"
        disabled={disabled}
      >
        <RadioGroup.Label className="sr-only">{label}</RadioGroup.Label>
        <div className="grid grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((r) => (
            <RadioGroup.Option key={r} value={r}>
              <RadioGroup.Label as="span">
                <span className="sr-only">{r} stars</span>
                {value >= r ? (
                  <FilledStarIcon className="h-6 w-6 text-yellow-500 -mt-0.5 -ml-0.5" aria-hidden="true" />
                ) : (
                  <EmptyStarIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                )}
              </RadioGroup.Label>
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Rating;
