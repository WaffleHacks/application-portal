import React from 'react';

import { BaseProps, generateId } from './common';

interface Props extends BaseProps<number> {
  min?: number;
  max?: number;
}

const Number = ({ label, className, value, onChange, required, min, max, disabled }: Props): JSX.Element => {
  const id = generateId('number', label);
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="number"
        id={id}
        max={max}
        min={min}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        disabled={disabled}
        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
      />
    </div>
  );
};

export default Number;
