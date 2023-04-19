import { Tab } from '@headlessui/react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { useField } from 'formik';
import React, { ReactNode } from 'react';

import { BaseProps, generateId } from './common';
import Link from '../Link';
import RenderMarkdown from '../RenderMarkdown';

type Props = BaseProps<string> & {
  description?: ReactNode;
};

const Markdown = ({ label, description, ...props }: Props): JSX.Element => {
  const [field, { error }] = useField(props);
  const { className, placeholder, autoComplete, disabled, required } = props;
  const { value } = field;
  const id = generateId('markdown', label);

  const hasError = error !== undefined;
  const errorId = id + '-error';

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Tab.Group>
        <Tab.List className="mt-2 flex items-center">
          <Tab
            className={({ selected }) =>
              classNames(
                selected
                  ? 'text-gray-900 bg-gray-100 hover:bg-gray-200'
                  : 'text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100',
                'px-3 py-1.5 border border-transparent text-sm font-medium rounded-md',
              )
            }
          >
            Write
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                selected
                  ? 'text-gray-900 bg-gray-100 hover:bg-gray-200'
                  : 'text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100',
                'ml-2 px-3 py-1.5 border border-transparent text-sm font-medium rounded-md',
              )
            }
          >
            Preview
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel className="p-0.5 -m-0.5 rounded-lg">
            <div className="relative">
              <textarea
                rows={5}
                id={id}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder={placeholder}
                autoComplete={autoComplete}
                disabled={disabled}
                required={required}
                aria-invalid={hasError}
                aria-describedby={hasError ? errorId : undefined}
                {...field}
              />
              {error && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                </div>
              )}
            </div>
          </Tab.Panel>
          <Tab.Panel className="p-0.5 -m-0.5 rounded-lg">
            <div className="border-b">
              <div className="mx-px mt-px px-3 py-2 text-sm leading-5 text-gray-800">
                <RenderMarkdown content={value} />
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      <div className="mt-2 mx-3 text-sm grid grid-cols-1 lg:grid-cols-3">
        <p className="text-gray-500 lg:col-span-2">
          You can use{' '}
          <Link
            to="https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
            external
          >
            GitHub-flavored markdown
          </Link>{' '}
          here to format the text. {description}
        </p>
        {error && (
          <p className="text-right text-red-600" id={errorId}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default Markdown;
