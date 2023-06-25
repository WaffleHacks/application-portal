import { ArrowPathIcon, DocumentPlusIcon, DocumentTextIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import React, { useId, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';

import { Button } from 'components/buttons';
import Card from 'components/Card';
import Loading from 'organizers/components/Loading';
import { JudgingUpload, useGetJudgingUploadUrlQuery } from 'store';

interface Props {
  next: (file?: string) => void;
}

const UploadStep = ({ next }: Props): JSX.Element => {
  const { data, isLoading } = useGetJudgingUploadUrlQuery();
  const [file, setFile] = useState<File | undefined>(undefined);

  if (isLoading || data === undefined) return <Loading />;

  return (
    <Card>
      <h3 className="text-lg font-semibold leading-8 text-gray-700">Upload the projects CSV</h3>
      <div className="max-w-4xl space-y-4">
        <p className="mt-2 text-md text-gray-600">
          Make sure the CSV contains the project data from DevPost with personally identifiable information included.
          The projects data can be found on the &quot;Metrics&quot; page under &quot;Manage hackathon&quot;.
        </p>
        <FileInput file={file} onChange={setFile} />
        <div className="flex justify-end">
          <SubmitButton file={file} next={next} preSignedUrl={data} />
        </div>
      </div>
    </Card>
  );
};

interface SubmitButtonProps {
  file?: File;
  next: (file?: string) => void;
  preSignedUrl: JudgingUpload;
}

const SubmitButton = ({ file, next, preSignedUrl }: SubmitButtonProps): JSX.Element => {
  const [isUploading, setUploading] = useState(false);

  const onSubmit = async () => {
    if (file === undefined) return;

    setUploading(true);

    const body = new FormData();
    // Add pre-computed fields
    for (const key in preSignedUrl.fields) body.append(key, preSignedUrl.fields[key]);

    // Add static fields
    body.append('acl', 'private');
    body.append('success_action_status', '201');
    body.append('Content-Type', file.type);
    body.append('X-AMZ-Algorithm', 'AWS4-HMAC-SHA256');
    body.append('file', file);

    try {
      const response = await fetch(preSignedUrl.url, { method: 'POST', body });

      // Wait a tiny bit to ensure it's available
      if (response.status === 201) setTimeout(() => next(preSignedUrl.name), 250);
      else toast.error('Failed to upload DevPost project data, please try again later');
    } catch (e) {
      toast.error('Failed to upload DevPost project data, please try again later');
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Button type="button" style="primary" onClick={onSubmit} disabled={file === undefined || isUploading}>
      {isUploading ? <ArrowPathIcon className="h-5 w-5 animate-spin" aria-hidden="true" /> : 'Upload'}
    </Button>
  );
};

interface FileInputProps {
  className?: string;
  file?: File;
  onChange: (file?: File) => void;
}

const FileInput = ({ className, file, onChange }: FileInputProps): JSX.Element => {
  const id = useId();
  const [error, setError] = useState<string | undefined>(undefined);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'text/csv': ['.csv'] },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
    onDrop: (files, rejections) => {
      if (files.length > 0) {
        onChange(files[0]);
        setError(undefined);
      } else if (rejections.length > 0) {
        onChange(undefined);
        setError(rejections[0].errors[0].message);
      }
    },
  });

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={classNames(
          error === undefined ? 'border-gray-300' : 'border-red-300',
          'flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md',
        )}
      >
        <div className="space-y-1 text-center">
          {inputIcon(file, error)}
          <div className={classNames(error === undefined ? 'text-gray-600' : 'text-red-500', 'flex text-sm')}>
            <p className="pl-1">{inputText(file, error)}</p>
            <input {...getInputProps()} id={id} className="sr-only" required />
          </div>
        </div>
      </div>
      {file && (
        <div className="flex justify-end">
          <Button className="mt-1" style="secondary" size="xs" onClick={() => onChange(undefined)}>
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};

const inputIcon = (file?: File, error?: string): JSX.Element => {
  if (error) return <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500 stroke-1" />;
  else if (file) return <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 stroke-1" />;
  else return <DocumentPlusIcon className="mx-auto h-12 w-12 text-gray-400 stroke-1" />;
};

const inputText = (file?: File, error?: string): string => {
  if (error) return error;
  else if (file) return file.name;
  else return 'Drag-n-drop or select a file';
};

export default UploadStep;
