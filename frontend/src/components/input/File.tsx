import { DocumentPlusIcon, DocumentTextIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { useField } from 'formik';
import React from 'react';
import { Accept, useDropzone } from 'react-dropzone';

import { Button } from 'components/buttons';

import { BaseProps, generateId } from './common';

type Props = BaseProps<File | undefined> & {
  description: string;
  accept?: Accept;
  maxSize?: number;
};

const File = ({ label, description, accept, maxSize, ...props }: Props): JSX.Element => {
  const [{ value }, { error }, { setValue, setError }] = useField(props);
  const { className, required } = props;
  const id = generateId('file', label);

  const { getRootProps, getInputProps } = useDropzone({
    accept,
    maxSize,
    onDrop: (files: File[], rejections) => {
      if (files.length > 0) {
        setValue(files[0]);
        setError(undefined);
      } else if (rejections.length > 0) setError(rejections[0].errors[0].message);
    },
  });

  let icon, text;
  if (error) {
    icon = <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500 stroke-1" />;
    text = error;
  } else if (value) {
    icon = <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 stroke-1" />;
    text = value.name;
  } else {
    icon = <DocumentPlusIcon className="mx-auto h-12 w-12 text-gray-400 stroke-1" />;
    text = 'Upload a file or drag and drop';
  }

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        {...getRootProps()}
        className={classNames(
          error !== undefined ? 'border-red-300' : 'border-gray-300',
          'mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md',
        )}
      >
        <div className="space-y-1 text-center">
          {icon}
          <div className={classNames(error !== undefined ? 'text-red-500' : 'text-gray-600', 'flex text-sm')}>
            <p className="pl-1">{text}</p>
            <input {...getInputProps()} id={id} className="sr-only" required={required} />
          </div>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      {value && (
        <div className="flex justify-end">
          <Button className="mt-1" style="secondary" size="xs" onClick={() => setValue(undefined)}>
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};

export default File;
