import React from 'react';
import { useParams } from 'react-router-dom';

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

const Feedback = (): JSX.Element => {
  const { code } = useParams();
  const { data: submitted = false, isLoading, isError, refetch } = useGetFeedbackStatusQuery(code as string);

  if (isLoading) return <Loading className="mt-10" />;
  if (isError) {
    return (
      <Status kind="failure" title="You're too early!">
        This event hasn&apos;t started yet!
        <br />
        <br />
        While we appreciate your enthusiasm for wanting to submit feedback, you should probably wait until you&apos;ve
        attended the event first.
      </Status>
    );
  }

  return (
    <Card className="mt-10">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-2xl leading-6 font-medium text-gray-900">Feedback</h3>
      </div>
      <div className="px-4 py-2 sm:px-6">
        {submitted ? <Submitted /> : <Form code={code as string} refetch={refetch} />}
      </div>
    </Card>
  );
};

export default Feedback;
