import { DocumentAddIcon, DocumentTextIcon } from '@heroicons/react/outline';
import { useField } from 'formik';
import React from 'react';
import { useDropzone } from 'react-dropzone';

import Button from '../Button';
import { BaseProps, generateId } from './common';

type Props = BaseProps<File | undefined> & {
  description: string;
  accept?: string[];
  maxSize?: number;
};

const File = ({ label, description, accept, maxSize, ...props }: Props): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [{ value }, _, { setValue }] = useField(props);
  const { className, required } = props;
  const id = generateId('file', label);

  const { getRootProps, getInputProps } = useDropzone({
    accept,
    maxSize,
    onDrop: (files: File[]) => {
      if (files.length > 0) setValue(files[0]);
    },
  });

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        {...getRootProps()}
        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
      >
        <div className="space-y-1 text-center">
          {value ? (
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 stroke-1" />
          ) : (
            <DocumentAddIcon className="mx-auto h-12 w-12 text-gray-400 stroke-1" />
          )}
          <div className="flex text-sm text-gray-600">
            <p className="pl-1">{value ? value.name : 'Upload a file or drag and drop'}</p>
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
