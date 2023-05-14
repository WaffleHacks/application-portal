import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Loading from 'participants/components/Loading';
import { useMarkAttendanceMutation } from 'store';

import Feedback from './Feedback';
import Status from './Status';

const Attendance = (): JSX.Element => {
  const { code } = useParams();
  const [mark, { isUninitialized, isLoading, isError }] = useMarkAttendanceMutation();

  useEffect(() => {
    if (isUninitialized) mark(code as string);
  }, [isUninitialized]);

  if (isUninitialized || isLoading) return <Loading />;
  if (isError) return <Status valid={false} />;

  return (
    <>
      <Status valid={true} />
      <Feedback code={code as string} />
    </>
  );
};

export default Attendance;
