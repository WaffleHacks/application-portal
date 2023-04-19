import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { useField } from 'formik';
import React from 'react';

import { BaseProps, generateId } from './common';

const Select = ({ label, ...props }: BaseProps<string>): JSX.Element => {
  const [field, { error }] = useField(props);
  const { required, placeholder, disabled, className, children } = props;
  const id = generateId('select', label);

  const hasError = error !== undefined;
  const errorId = id + '-error';

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <select
          id={id}
          {...field}
          className={classNames(
            hasError
              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500',
            'block w-full py-2 px-3 border bg-white rounded-md shadow-sm focus:outline-none sm:text-sm',
          )}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
        >
          <option defaultChecked>Select an option...</option>
          {children}
        </select>
        {error && (
          <div className="absolute inset-y-0 right-5 pr-3 flex items-center pointer-events-none">
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

export default Select;
