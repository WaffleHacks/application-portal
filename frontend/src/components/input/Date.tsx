import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { useField } from 'formik';
import React from 'react';
import Flatpickr from 'react-flatpickr';

import { BaseProps, generateId } from './common';

const CORRECTED_DATE_FORMAT = /^\d{4}-\d{1,2}-\d{1,2}$/;

const Date = ({ label, ...props }: BaseProps<string>): JSX.Element => {
  const [{ value }, { error }, { setValue }] = useField(props);
  const { className, required, disabled } = props;
  const id = generateId('date', label);

  const hasError = error !== undefined;
  const errorId = id + '-error';

  // Switch from DD-MM-YYYY to YYYY-MM-DD date format
  if (!CORRECTED_DATE_FORMAT.test(value)) setValue(value.split('-').reverse().join('-'), true);

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <Flatpickr
          id={id}
          required={required}
          disabled={disabled}
          options={{ altInput: true, altFormat: 'F j, Y', dateFormat: 'Y-m-d' }}
          value={value}
          onChange={(date) => setValue(`${date[0].getDate()}-${date[0].getMonth() + 1}-${date[0].getFullYear()}`)}
          className={classNames(
            hasError
              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500',
            'block w-full shadow-sm sm:text-sm rounded-md',
          )}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Date;
