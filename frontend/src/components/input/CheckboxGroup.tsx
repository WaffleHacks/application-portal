import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Field, useField } from 'formik';
import React from 'react';

import { generateId } from './common';

interface Item {
  description?: string;
  value: string;
}

interface ItemProps {
  item: Item;
  name: string;
  required: boolean;
}

const CheckboxItem = ({ name, item }: ItemProps): JSX.Element => {
  const id = generateId('checkbox-group-item', item.value);

  return (
    <div className="flex items-start">
      <div className="h-5 flex items-center">
        <Field
          type="checkbox"
          id={id}
          name={name}
          value={item.value}
          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={id} className="font-medium text-gray-700">
          {item.value}
        </label>
        {item.description && <p className="text-gray-500">{item.description}</p>}
      </div>
    </div>
  );
};

interface Props {
  className?: string;
  label: string;
  name: string;
  items: Item[];
  required?: boolean;
}

const CheckboxGroup = ({ className, label, name, items, required = false }: Props): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, { error }] = useField(name);

  return (
    <fieldset className={className}>
      <legend className="sr-only">{label}</legend>
      <div className="text-sm font-medium text-gray-700" aria-hidden="true">
        {label} {required && <span className="text-red-500">*</span>}
      </div>
      <div className="mt-1 space-y-4">
        {items.map((item) => (
          <CheckboxItem key={item.value} name={name} item={item} required={required} />
        ))}
      </div>
      {error && (
        <p className="flex mt-2 text-sm text-red-600">
          <ExclamationCircleIcon className="mr-1 h-5 w-5 text-red-500" aria-hidden="true" />
          {error}
        </p>
      )}
    </fieldset>
  );
};

export default CheckboxGroup;
