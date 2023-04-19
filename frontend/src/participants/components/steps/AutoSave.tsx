import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { FormikValues, useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';

interface Props<Values extends FormikValues> {
  debounce?: number;
  onSave: (values: Values) => unknown | Promise<unknown>;
  isSaving: boolean;
}

const AutoSave = <Values extends FormikValues>({
  debounce: debounceMs = 250,
  isSaving,
  onSave,
}: Props<Values>): JSX.Element => {
  const { values, validateForm } = useFormikContext<Values>();
  const [awaiting, setAwaiting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAwaiting(true);
      validateForm();
      Promise.resolve(onSave(values)).then(() => setAwaiting(false));
    }, debounceMs);
    return () => clearTimeout(timeout);
  }, [debounceMs, values]);

  const icon =
    awaiting || isSaving ? (
      <ArrowPathIcon className="inline h-4 w-4 animate-spin" />
    ) : (
      <CheckCircleIcon className="inline h-4 w-4" />
    );
  const text = awaiting || isSaving ? 'Saving...' : 'Saved';

  return (
    <span className="text-sm text-gray-500">
      {icon}
      <span className="ml-1">{text}</span>
    </span>
  );
};

export default AutoSave;
