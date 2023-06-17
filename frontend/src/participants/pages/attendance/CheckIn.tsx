import React, { useEffect } from 'react';

import Loading from 'participants/components/Loading';
import Status from 'participants/components/Status';
import { useCheckInParticipantMutation } from 'store';

const CheckIn = (): JSX.Element => {
  const [mark, { isLoading, isUninitialized, isError }] = useCheckInParticipantMutation();

  useEffect(() => {
    if (isUninitialized) mark();
  }, [isUninitialized]);

  if (isLoading) return <Loading />;

  if (isError) {
    return (
      <Status kind="failure" title="Check-in hasn't opened yet">
        Check-in will open at the start of the hackathon.
        <br />
        If you believe this is incorrect, please contact an organizer.
      </Status>
    );
  } else {
    return (
      <Status kind="success" title="You're checked-in!">
        You&apos;ve been marked as checked-in! Enjoy the hackathon!
      </Status>
    );
  }
};

export default CheckIn;
