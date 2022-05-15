import { ExclamationCircleIcon } from '@heroicons/react/outline';
import classNames from 'classnames';
import { useField } from 'formik';
import React from 'react';
import BasePhoneInput from 'react-phone-number-input';

import 'react-phone-number-input/style.css';

import { BaseProps, generateId } from './common';

const PhoneInput = ({ label, ...props }: BaseProps<string>): JSX.Element => {
  const [{ value }, { error }, { setValue }] = useField(props);
  const { className, required, disabled, autoComplete = 'tel' } = props;

  const id = generateId('phone', label);
  const hasError = error !== undefined;
  const errorId = id + '-error';

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1 relative">
        <BasePhoneInput
          numberInputProps={{
            className: classNames(
              error
                ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
                : 'focus:ring-indigo-500 focus:border-indigo-500 border-gray-300',
              'block w-full shadow-sm sm:text-sm rounded-md',
            ),
            id,
            'aria-describedby': hasError ? errorId : undefined,
            'aria-invalid': hasError,
          }}
          defaultCountry="US"
          international={false}
          limitMaxLength
          value={value}
          onChange={(v) => setValue(v as string, true)}
          autoComplete={autoComplete}
          disabled={disabled}
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

export default PhoneInput;
