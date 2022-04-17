import React, { ReactNode } from 'react';

import { BaseProps, generateId } from './common';

interface Props extends BaseProps<string> {
  children?: ReactNode;
}

const Select = ({
  label,
  className,
  value,
  onChange,
  placeholder,
  required,
  children,
  disabled,
}: Props): JSX.Element => {
  const id = generateId('select', label);
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={id}
        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
