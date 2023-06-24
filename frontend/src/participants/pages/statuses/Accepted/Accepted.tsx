import { ArrowTopRightOnSquareIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { toast } from 'react-hot-toast';

import { LinkButton } from 'components/buttons';
import Card from 'components/Card';
import Status from 'participants/components/Status';

import SubmissionCountdown from './SubmissionCountdown';

interface Props {
  projectCode: string;
}

const SubmissionCode = ({ projectCode }: Props): JSX.Element => {
  const onClick = async () => {
    await navigator.clipboard.writeText(projectCode);
    toast.success('Copied submission code to clipboard');
  };

  return (
    <code className="ml-2 text-lg rounded-md p-1.5 bg-gray-200">
      {projectCode}
      <button type="button" className="px-1" onClick={onClick}>
        <ClipboardDocumentIcon className="h-4 w-4 text-gray-700 hover:text-indigo-600" />
      </button>
    </code>
  );
};

const Accepted = ({ projectCode }: Props): JSX.Element => (
  <>
    <Status kind="success" title="Congratulations, you're in!">
      We look forward to seeing what project you build.
      <br />
      <br />
      <LinkButton to="https://discord.gg/xDkwbAqU55" style="success" external>
        Discord <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-2" aria-hidden="true" />
      </LinkButton>
      <br />
      <br />
      Don&apos;t forget to join our Discord to receive announcements, participate in workshops, and connect with other
      participants!
    </Status>

    <h1 className="mt-6 text-3xl font-bold leading-tight text-gray-900">Project Submission</h1>
    <Card className="text-center">
      <SubmissionCountdown />
      <br />
      Once you&apos;re ready to submit, head on over to our{' '}
      <a
        className="text-blue-500 hover:underline"
        href="https://wafflehacks-2023.devpost.com"
        target="_blank"
        rel="noreferrer"
      >
        DevPost
      </a>{' '}
      to have your project judged.
      <hr className="border-1 my-6" />
      Your submission code is <SubmissionCode projectCode={projectCode} />
      <br />
      You&apos;ll need this code from each of your team members when submitting your project.
    </Card>
  </>
);

export default Accepted;
