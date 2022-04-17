import { ExclamationCircleIcon } from '@heroicons/react/outline';
import classNames from 'classnames';
import { useField } from 'formik';
import React from 'react';

import { BaseProps, generateId } from './common';

const Text = ({ label, ...props }: BaseProps<string>): JSX.Element => {
  const [field, { error }] = useField(props);
  const { className, placeholder, autoComplete, disabled, required } = props;
  const id = generateId('text', label);

  const hasError = error !== undefined;
  const errorId = id + '-error';

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          type="text"
          id={id}
          className={classNames(
            error
              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
              : 'focus:ring-indigo-500 focus:border-indigo-500 border-gray-300',
            'block w-full shadow-sm sm:text-sm rounded-md',
          )}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          {...field}
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

export default Text;
