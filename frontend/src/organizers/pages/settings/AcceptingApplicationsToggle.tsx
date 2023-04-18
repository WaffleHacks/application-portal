import { Switch } from '@headlessui/react';
import classNames from 'classnames';
import React from 'react';

import Badge from '../../../components/Badge';
import { useSetAcceptingApplicationsSettingMutation } from '../../../store';
import { UpdatableItem } from '../../components/description';

interface CheckboxProps {
  value: boolean;
  setValue: (value: boolean) => void;
}

const Checkbox = ({ value, setValue }: CheckboxProps): JSX.Element => {
  return (
    <Switch
      checked={value}
      onChange={setValue}
      className={classNames(
        value ? 'bg-indigo-600' : 'bg-gray-200',
        'ml-1 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
      )}
    >
      <span
        aria-hidden="true"
        className={classNames(
          value ? 'translate-x-5' : 'translate-x-0',
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
        )}
      >
        <span
          className={classNames(
            value ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200',
            'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity',
          )}
          aria-hidden="true"
        >
          <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
            <path
              d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span
          className={classNames(
            value ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100',
            'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity',
          )}
          aria-hidden="true"
        >
          <svg className="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
            <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
          </svg>
        </span>
      </span>
    </Switch>
  );
};

interface Props {
  value: boolean;
}

const AcceptingApplicationsToggle = ({ value }: Props): JSX.Element => {
  const [update, { isLoading }] = useSetAcceptingApplicationsSettingMutation();

  return (
    <UpdatableItem
      label="Accepting applications?"
      loading={isLoading}
      value={value}
      onSave={update}
      display={(v: boolean) => <Badge color={v ? 'green' : 'red'}>{v ? 'Yes' : 'No'}</Badge>}
    >
      {(value: boolean, setValue) => <Checkbox value={value} setValue={setValue} />}
    </UpdatableItem>
  );
};

export default AcceptingApplicationsToggle;
