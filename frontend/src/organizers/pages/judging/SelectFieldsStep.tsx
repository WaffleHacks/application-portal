import { ArrowPathIcon } from '@heroicons/react/24/outline';
import React, { ChangeEvent, ReactNode, useEffect, useId, useState } from 'react';

import Card from 'components/Card';
import Loading from 'organizers/components/Loading';
import { useGetJudgingHeadersListQuery, useInitiateJudgingDataProcessMutation } from 'store';

import { Button } from '../../../components/buttons';

interface Props {
  next: () => void;
  file: string;
}

const SelectFieldsStep = ({ next, file }: Props): JSX.Element => {
  const { data: fields = [], isLoading } = useGetJudgingHeadersListQuery(file);
  const [initiate, { isLoading: isSubmitting }] = useInitiateJudgingDataProcessMutation();

  const [projectName, setProjectName] = useState<string | undefined>(undefined);
  const [projectUrl, setProjectUrl] = useState<string | undefined>(undefined);
  const [projectStatus, setProjectStatus] = useState<string | undefined>(undefined);
  const [judgingStatus, setJudgingStatus] = useState<string | undefined>(undefined);
  const [submissionCode, setSubmissionCode] = useState<string | undefined>(undefined);

  const submitDisabled =
    projectName === undefined ||
    projectUrl === undefined ||
    projectStatus === undefined ||
    judgingStatus === undefined ||
    submissionCode === undefined ||
    isSubmitting;

  const onSubmit = async () => {
    if (submitDisabled) return;

    await initiate({
      file,
      url: projectUrl,
      name: projectName,
      project_status: projectStatus,
      judging_status: judgingStatus,
      submission_code: submissionCode,
    });

    next();
  };

  if (isLoading) return <Loading />;

  const options = fields.map((f, i) => <option key={i}>{f}</option>);

  return (
    <Card>
      <h3 className="text-lg font-semibold leading-8 text-gray-700">Select columns to use</h3>
      <div className="mt-2 gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Select label="Project Name" value={projectName} onChange={setProjectName} disabled={isSubmitting}>
          {options}
        </Select>
        <Select label="Project URL" value={projectUrl} onChange={setProjectUrl} disabled={isSubmitting}>
          {options}
        </Select>
        <Select label="Project Status" value={projectStatus} onChange={setProjectStatus} disabled={isSubmitting}>
          {options}
        </Select>
        <Select label="Judging Status" value={judgingStatus} onChange={setJudgingStatus} disabled={isSubmitting}>
          {options}
        </Select>
        <Select label="Submission Code" value={submissionCode} onChange={setSubmissionCode} disabled={isSubmitting}>
          {options}
        </Select>
      </div>
      <div className="flex justify-end">
        <Button type="button" style="success" onClick={onSubmit} disabled={submitDisabled}>
          {isSubmitting ? <ArrowPathIcon className="h-5 w-5 animate-spin" aria-hidden="true" /> : 'Start processing'}
        </Button>
      </div>
    </Card>
  );
};

export default SelectFieldsStep;

interface SelectProps {
  label: string;
  value?: string;
  onChange: (value?: string) => void;
  disabled?: boolean;
  children?: ReactNode;
}

const Select = ({ label, value, onChange, children, disabled }: SelectProps): JSX.Element => {
  const id = useId();

  const handler = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === '-1') onChange(undefined);
    else onChange(value);
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <select
          id={id}
          className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 block w-full py-2 px-3 border bg-white rounded-md shadow-sm focus:outline-none sm:text-sm disabled:bg-gray-200"
          required
          placeholder="Select a column"
          value={value}
          onChange={handler}
          disabled={disabled}
        >
          <option value={-1} defaultChecked>
            Select an option...
          </option>
          {children}
        </select>
      </div>
    </div>
  );
};
