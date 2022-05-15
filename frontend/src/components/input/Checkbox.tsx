import classNames from 'classnames';
import { useField } from 'formik';
import React from 'react';

import { BaseProps, generateId } from './common';

const Checkbox = ({ label, ...props }: BaseProps<string>): JSX.Element => {
  const [field] = useField(props);
  const { className, disabled, required } = props;
  const id = generateId('checkbox', label);

  return (
    <div className={classNames('flex items-center', className)}>
      <input
        id={id}
        type="checkbox"
        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
        required={required}
        disabled={disabled}
        {...field}
      />
      <label htmlFor={id} className="ml-3 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    </div>
  );
};

export default Checkbox;
