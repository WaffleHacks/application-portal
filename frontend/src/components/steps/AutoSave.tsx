import { CheckCircleIcon, RefreshIcon } from '@heroicons/react/outline';
import { FormikValues, useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';

interface Props<Values extends FormikValues> {
  debounce?: number;
  onSave: (values: Values) => void | Promise<void>;
}

const AutoSave = <Values,>({ debounce: debounceMs = 250, onSave }: Props<Values>): JSX.Element => {
  const { values } = useFormikContext<Values>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSaving(true);
      Promise.resolve(onSave(values)).then(() => setSaving(false));
    }, debounceMs);
    return () => clearTimeout(timeout);
  }, [debounceMs, values]);

  const icon = saving ? (
    <RefreshIcon className="inline h-4 w-4 animate-spin" />
  ) : (
    <CheckCircleIcon className="inline h-4 w-4" />
  );
  const text = saving ? 'Saving...' : 'Saved';

  return (
    <span className="text-sm text-gray-500">
      {icon}
      <span className="ml-1">{text}</span>
    </span>
  );
};

export default AutoSave;
