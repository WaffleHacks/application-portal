import { useField } from 'formik';
import React from 'react';

import { BaseProps, generateId } from './common';

const Text = ({ label, ...props }: BaseProps<string>): JSX.Element => {
  const [field] = useField(props);
  const { className, placeholder, autoComplete, disabled, required } = props;
  const id = generateId('text', label);
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        id={id}
        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        {...field}
      />
    </div>
  );
};

export default Text;
