import classNames from 'classnames';
import React from 'react';

interface Props {
  id: string;
  label: string;
  value: string;
  className?: string;
}

const ReadOnlyText = ({ id, label, value, className }: Props): JSX.Element => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label} (read only)
    </label>
    <div className="mt-1 relative rounded-md shadow-sm">
      <input
        type="text"
        id={id}
        className={classNames('bg-gray-100 border-gray-300 block w-full shadow-sm sm:text-sm rounded-md', className)}
        disabled
        value={value}
      />
    </div>
  </div>
);

export default ReadOnlyText;
