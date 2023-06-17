import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Link from 'components/Link';
import Loading from 'participants/components/Loading';
import Status from 'participants/components/Status';
import { useGetEventAttendanceQuery } from 'store';

const Attendance = (): JSX.Element => {
  const { code } = useParams();
  const { data, isLoading, isError } = useGetEventAttendanceQuery(code as string);

  useEffect(() => {
    if (isLoading || data === undefined) return;

    setTimeout(() => {
      if (data.link) window.location.href = data.link;
    }, 1000);
  }, [isLoading, data]);

  if (isLoading || data === undefined) return <Loading />;
  if (isError) {
    return (
      <Status kind="failure" title="This event URL isn't valid">
        If you believe this is incorrect, please contact an organizer.
      </Status>
    );
  }

  if (data.link) {
    return (
      <Status
        kind="success"
        title={
          <>
            Redirecting you to <b>{data.name}</b>...
          </>
        }
      >
        If you aren&apos;t redirected shortly, please click{' '}
        <a className="text-blue-500 hover:underline" href={data.link}>
          here
        </a>
      </Status>
    );
  } else {
    return (
      <Status kind="success" title="Attendance recorded!">
        We hope you enjoy <b>{data.name}</b>!
        <br />
        <br />
        You can check your <Link to="/swag">swag progress</Link> to see what amazing things you&apos;ll get!
      </Status>
    );
  }
};

export default Attendance;
