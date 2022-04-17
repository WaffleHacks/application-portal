import React from 'react';
import Flatpickr from 'react-flatpickr';

import { BaseProps, generateId } from './common';

const Date = ({ label, className, value, onChange, required, disabled }: BaseProps<string>): JSX.Element => {
  const id = generateId('date', label);
  console.log('rendered');

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Flatpickr
        id={id}
        required={required}
        disabled={disabled}
        options={{ altInput: true, altFormat: 'F j, Y', dateFormat: 'd-m-Y' }}
        value={value}
        onChange={(date) => onChange(`${date[0].getDate()}-${date[0].getMonth() + 1}-${date[0].getFullYear()}`)}
        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
      />
    </div>
  );
};

export default Date;
