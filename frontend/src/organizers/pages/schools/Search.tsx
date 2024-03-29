import { Combobox } from '@headlessui/react';
import { ArrowsUpDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import algoliasearch from 'algoliasearch/lite';
import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';

const APP_ID = process.env.REACT_APP_ALGOLIA_APP_ID || '';
const API_KEY = process.env.REACT_APP_ALGOLIA_API_KEY || '';

export interface SearchItem {
  objectID: string;
  name: string;
}

interface Props {
  label?: string;
  value?: SearchItem;
  onClick: (item: SearchItem) => void;
}

const Search = ({ label = 'Search', onClick, value }: Props): JSX.Element => {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<SearchItem[]>([]);

  const client = useMemo(() => algoliasearch(APP_ID, API_KEY), [APP_ID, API_KEY]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (query.length === 0) {
        setOptions([]);
        return;
      }

      const responses = await client.search<SearchItem>([
        {
          type: 'default',
          indexName: 'schools',
          query,
          params: {
            hitsPerPage: 10,
          },
        },
      ]);

      const { hits } = responses.results[0];
      setOptions(hits);
    }, 250);

    return () => clearTimeout(timeout);
  }, [client, query]);

  return (
    <Combobox as="div" value={value} onChange={onClick} className="max-w-md">
      <Combobox.Label className="block text-sm font-medium text-gray-700">{label}</Combobox.Label>
      <div className="relative mt-1 rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <Combobox.Input
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
          onChange={(e) => setQuery(e.target.value)}
          displayValue={(item?: SearchItem) => item?.name || ''}
          autoComplete="off"
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ArrowsUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        {options.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {options.map((o) => (
              <Combobox.Option
                key={o.objectID}
                value={o}
                className={({ active }) =>
                  classNames(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                  )
                }
              >
                <span className="block truncate">{o.name}</span>
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
};

export default Search;
