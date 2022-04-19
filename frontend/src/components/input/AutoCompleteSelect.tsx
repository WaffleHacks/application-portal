import { Combobox } from '@headlessui/react';
import { CheckIcon, ExclamationCircleIcon, SelectorIcon } from '@heroicons/react/outline';
import algoliasearch from 'algoliasearch/lite';
import classNames from 'classnames';
import { useField } from 'formik';
import React, { useEffect, useMemo, useState } from 'react';

import { BaseProps, generateId } from './common';

export interface BaseItem {
  objectID: string;
}

type Props<Item extends BaseItem> = BaseProps<string> & {
  indexName: string;
  appId: string;
  apiKey: string;
  display?: (item: Item) => string;
};

const AutoCompleteSelect = <Item extends BaseItem>({
  label,
  indexName,
  appId,
  apiKey,
  display = (item) => item.objectID,
  ...props
}: Props<Item>): JSX.Element => {
  const [{ value, name }, { error }, { setValue }] = useField(props);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<string[]>([]);

  const client = useMemo(() => algoliasearch(appId, apiKey), [appId, apiKey]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (query.length === 0) {
        setOptions([]);
        return;
      }

      const responses = await client.search<Item>([
        {
          type: 'default',
          indexName,
          query,
          params: {
            hitsPerPage: 5,
          },
        },
      ]);
      const { hits } = responses.results[0];
      setOptions(hits.map((v) => display(v)));
    }, 250);

    return () => clearTimeout(timeout);
  }, [client, query, indexName]);

  useEffect(() => console.log(value), [value]);

  const { className, placeholder, required, disabled } = props;
  const hasError = error !== undefined;
  const errorId = generateId('autocomplete-select', label) + '-error';

  return (
    <Combobox as="div" value={value} onChange={(v) => setValue(v, true)} className={className}>
      <Combobox.Label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Combobox.Label>
      <div className="relative mt-1 rounded-md shadow-sm">
        <Combobox.Input
          name={name}
          className={classNames(
            hasError
              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500',
            'w-full rounded-md border bg-white py-2 pl-3 pr-10 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm',
          )}
          onChange={(e) => setQuery(e.target.value)}
          displayValue={(v: string) => v}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
          aria-describedby={errorId}
          aria-invalid={hasError}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>
        {error && (
          <div className="absolute inset-y-0 right-5 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}

        {options.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {options.map((option) => (
              <Combobox.Option
                key={option}
                value={option}
                className={({ active }) =>
                  classNames(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <span className={classNames('block truncate', selected && 'font-semibold')}>{option}</span>

                    {selected && (
                      <span
                        className={classNames(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          active ? 'text-white' : 'text-indigo-600',
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
};

export default AutoCompleteSelect;
