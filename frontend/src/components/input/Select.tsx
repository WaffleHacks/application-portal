import { useField } from 'formik';
import React from 'react';

import { BaseProps, generateId } from './common';

const Select = ({ label, ...props }: BaseProps<string>): JSX.Element => {
  const [field] = useField(props);
  const { required, placeholder, disabled, className, children } = props;
  const id = generateId('select', label);

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={id}
        {...field}
        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        disabled={disabled}
        required={required}
        placeholder={placeholder}
      >
        <option defaultChecked>Select an option...</option>
        {children}
      </select>
    </div>
  );
};

export default Select;
