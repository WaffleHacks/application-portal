import React from 'react';

import { BaseProps, generateId } from './common';

const Checkbox = ({ label, className, value, onChange, required, disabled }: BaseProps<boolean>): JSX.Element => {
  const id = generateId('checkbox', label);
  return (
    <div className={className}>
      <input
        id={id}
        type="checkbox"
        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
        required={required}
        disabled={disabled}
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label htmlFor={id} className="ml-3 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    </div>
  );
};

export default Checkbox;
