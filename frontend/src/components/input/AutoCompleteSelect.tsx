import { Combobox } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/outline';
import algoliasearch from 'algoliasearch/lite';
import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';

export interface BaseItem {
  objectID: string;
}

interface Props<Item extends BaseItem> {
  indexName: string;
  appId: string;
  apiKey: string;
  selected?: Item;
  onSelect?: (item: Item) => void;
  display?: (item: Item) => string;
}

const AutoCompleteSelect = <Item extends BaseItem>({
  indexName,
  appId,
  apiKey,
  display = (item) => item.objectID,
}: Props<Item>): JSX.Element => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Item>();
  const [options, setOptions] = useState<Item[]>([]);

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
      setOptions(hits);
    }, 250);

    return () => clearTimeout(timeout);
  }, [client, query, indexName]);

  return (
    <Combobox as="div" value={selected} onChange={setSelected}>
      <Combobox.Label className="block text-sm font-medium text-gray-700">Label TODO</Combobox.Label>
      <div className="relative mt-1">
        <Combobox.Input
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          onChange={(e) => setQuery(e.target.value)}
          displayValue={display}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        {options.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {options.map((option) => (
              <Combobox.Option
                key={option.objectID}
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
                    <span className={classNames('block truncate', selected && 'font-semibold')}>{display(option)}</span>

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
