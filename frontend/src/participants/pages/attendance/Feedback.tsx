import React from 'react';

import Card from 'components/Card';
import Loading from 'participants/components/Loading';
import Status from 'participants/components/Status';
import { useGetFeedbackStatusQuery } from 'store';

import Form from './Form';

const Submitted = (): JSX.Element => (
  <Status kind="success" title="Submitted!" standalone>
    Thanks for submitting your feedback! We&apos;ll use it to make next year even better!
  </Status>
);

interface Props {
  code: string;
}

const Feedback = ({ code }: Props): JSX.Element => {
  const { data: submitted = false, isLoading, refetch } = useGetFeedbackStatusQuery(code);

  if (isLoading) return <Loading className="mt-10" />;

  return (
    <Card className="mt-10">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-2xl leading-6 font-medium text-gray-900">Feedback</h3>
      </div>
      <div className="px-4 py-2 sm:px-6">{submitted ? <Submitted /> : <Form code={code} refetch={refetch} />}</div>
    </Card>
  );
};

export default Feedback;
