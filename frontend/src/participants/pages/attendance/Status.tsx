import React from 'react';

import Link from 'components/Link';
import BaseStatus from 'participants/components/Status';

interface Props {
  valid: boolean;
}

const Status = ({ valid }: Props): JSX.Element => {
  if (valid) {
    return (
      <BaseStatus kind="success" title="Attendance recorded!">
        Check your <Link to="/swag">Swag Progress</Link> to see what amazing swag you&apos;ll get!
        <br />
        <br />
        Feel free to give us the gift of feedback by filling out the form below. It will only take a minute or so of
        your time.
      </BaseStatus>
    );
  } else {
    return (
      <BaseStatus kind="failure" title="This attendance URL is no longer valid.">
        If you believe this is incorrect, please contact an organizer.
      </BaseStatus>
    );
  }
};

export default Status;
