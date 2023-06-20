import { DateTime } from 'luxon';
import React from 'react';
import Flatpickr from 'react-flatpickr';

import { UpdatableItem } from 'organizers/components/description';
import { useSetCheckInEndSettingMutation, useSetCheckInStartSettingMutation } from 'store';

interface InputProps {
  value: string;
  setValue: (value: string) => void;
}

const DateTimeInput = ({ value, setValue }: InputProps): JSX.Element => (
  <div className="relative rounded-md shadow-sm w-1/2">
    <Flatpickr
      options={{ enableTime: true, altInput: true, altFormat: 'F j, Y at h:i K', dateFormat: 'Z' }}
      value={value}
      onChange={(date, currentDateString) => setValue(currentDateString)}
      className="block w-full shadow-sm sm:text-sm rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
    />
  </div>
);

interface Props {
  value: string;
}

export const CheckInStartItem = ({ value }: Props): JSX.Element => {
  const [update, { isLoading }] = useSetCheckInStartSettingMutation();

  return (
    <UpdatableItem
      label="Starts at"
      loading={isLoading}
      value={value}
      onSave={update}
      display={(value: string) => DateTime.fromISO(value).toLocaleString(DateTime.DATETIME_MED)}
    >
      {(value, setValue) => <DateTimeInput value={value} setValue={setValue} />}
    </UpdatableItem>
  );
};

export const CheckInEndItem = ({ value }: Props): JSX.Element => {
  const [update, { isLoading }] = useSetCheckInEndSettingMutation();

  return (
    <UpdatableItem
      label="Ends at"
      loading={isLoading}
      value={value}
      onSave={update}
      display={(value: string) => DateTime.fromISO(value).toLocaleString(DateTime.DATETIME_MED)}
    >
      {(value, setValue) => <DateTimeInput value={value} setValue={setValue} />}
    </UpdatableItem>
  );
};
