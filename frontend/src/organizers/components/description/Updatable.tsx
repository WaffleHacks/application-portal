import { ArrowPathIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import React, { ReactNode, useCallback, useState } from 'react';

interface UpdatableSectionProps {
  children: ReactNode;
}

export const UpdatableSection = ({ children }: UpdatableSectionProps): JSX.Element => (
  <div className="border-t border-gray-200 px-4">
    <dl className="divide-y divide-gray-200">{children}</dl>
  </div>
);

interface MinimalButtonProps {
  type?: 'button' | 'submit';
  style?: 'primary' | 'danger';
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

const MinimalButton = ({
  type = 'button',
  disabled,
  onClick,
  style = 'primary',
  children,
}: MinimalButtonProps): JSX.Element => (
  <button
    type={type}
    className={classNames(
      'bg-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 inline-flex',
      {
        'text-indigo-600 hover:text-indigo-500 disabled:text-indigo-300': style === 'primary',
        'text-red-600 hover:text-red-500 disabled:text-red-300': style === 'danger',
      },
    )}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

interface UpdatableItemProps<T> {
  label: string;
  loading: boolean;
  value: T;
  onSave: (value: T) => void;
  display: (value: T) => ReactNode | undefined;
  children: (value: T, setValue: (value: T) => void) => ReactNode;
}

export const UpdatableItem = <T,>({
  label,
  loading,
  value: initialValue,
  onSave,
  display,
  children,
}: UpdatableItemProps<T>): JSX.Element => {
  const [updating, setUpdating] = useState(false);
  const [value, setValue] = useState(initialValue);

  const onCancel = useCallback(() => {
    setUpdating(false);
    setValue(initialValue);
  }, [initialValue]);

  const onSubmit = useCallback(() => {
    onSave(value);
    setUpdating(false);
  }, [value]);

  const toggles = updating ? (
    <div className="inline-flex">
      <MinimalButton style="danger" onClick={onCancel} disabled={loading}>
        Cancel
      </MinimalButton>
      <span className="text-gray-500 font-bold mx-3" aria-hidden="true">
        {loading ? <ArrowPathIcon className="mt-0.5 h-4 w-4 animate-spin" aria-hidden="true" /> : '|'}
      </span>
      <MinimalButton onClick={onSubmit} disabled={loading}>
        Save
      </MinimalButton>
    </div>
  ) : (
    <MinimalButton onClick={() => setUpdating(true)}>Update</MinimalButton>
  );

  return (
    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
        <span className="flex-grow">{updating ? children(value, setValue) : display(value)}</span>
        <span className="ml-4 flex-shrink-0">{toggles}</span>
      </dd>
    </div>
  );
};
