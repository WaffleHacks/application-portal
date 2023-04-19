import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useField } from 'formik';
import React from 'react';

import { BaseProps, generateId } from './common';

const LongText = ({ label, ...props }: BaseProps<string>): JSX.Element => {
  const [field, { error }] = useField(props);
  const { className, required, disabled, autoComplete } = props;
  const id = generateId('long-text', label);

  const hasError = error !== undefined;
  const errorId = id + '-error';

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1 relative">
        <textarea
          rows={4}
          id={id}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          {...field}
        />
        {error && (
          <div className="absolute inset-y-0 right-1 pr-3 flex items-center pointer-events-none">
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

export default LongText;
