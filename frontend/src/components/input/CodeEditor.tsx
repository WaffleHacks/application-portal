import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { FieldHookConfig, useField } from 'formik';
import { nanoid } from 'nanoid';
import React, { ReactNode } from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/theme-tomorrow';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface BaseProps {
  id: string;
  disabled: boolean;
  value?: string;
  onChange?: (v: string) => void;
}

const BaseCodeEditor = ({ disabled, id, onChange = noop, value }: BaseProps): JSX.Element => (
  <AceEditor
    className={classNames('mt-1', { 'pointer-events-none': disabled })}
    width="100%"
    mode="html"
    theme="tomorrow"
    name={id}
    fontSize={14}
    showPrintMargin={false}
    showGutter={true}
    highlightActiveLine={true}
    value={value}
    onChange={(v) => onChange(v)}
    setOptions={{
      readOnly: disabled,
      useWorker: false,
      showLineNumbers: true,
      tabSize: 2,
      scrollPastEnd: true,
    }}
  />
);

type Props = FieldHookConfig<string> & {
  label: string;
  description?: ReactNode;
};

const CodeEditor = ({ label, description, ...props }: Props): JSX.Element => {
  const [{ value }, { error }, { setValue }] = useField(props);
  const { className, disabled = false, required } = props;

  const id = nanoid(8);

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {description && <p className="my-1 ml-3 text-sm text-gray-500">{description}</p>}
      <BaseCodeEditor id={id} disabled={disabled} value={value} onChange={(v) => setValue(v, true)} />
      {error && (
        <p className="flex mt-2 text-sm text-red-600">
          <ExclamationCircleIcon className="mr-1 h-5 w-5 text-red-500" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
};

export { CodeEditor, BaseCodeEditor };
