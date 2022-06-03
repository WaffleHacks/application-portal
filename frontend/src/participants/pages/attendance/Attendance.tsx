import { RefreshIcon } from '@heroicons/react/outline';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Card from '../../../components/Card';
import { useMarkAttendanceMutation } from '../../../store';
import Feedback from './Feedback';
import Status from './Status';

const Attendance = (): JSX.Element => {
  const { code } = useParams();
  const [mark, { isUninitialized, isLoading, isError }] = useMarkAttendanceMutation();

  useEffect(() => {
    if (isUninitialized) mark(code as string);
  }, [isUninitialized]);

  if (isUninitialized || isLoading)
    return (
      <Card className="flex justify-around">
        <RefreshIcon className="h-8 w-8 animate-spin" />
      </Card>
    );
  if (isError) return <Status valid={false} />;

  return (
    <>
      <Status valid={true} />
      <Feedback code={code as string} />
    </>
  );
};

export default Attendance;
