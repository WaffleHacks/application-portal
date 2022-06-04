import React from 'react';

import Link from '../../../components/Link';
import Status from '../../components/Status';

const Rejected = (): JSX.Element => (
  <Status kind="failure" title="Your application was rejected">
    It is with our sincerest regret to inform you that our admissions committee has chosen to not accept your
    application. We invite you to apply again next year.
    <br />
    <br />
    There are plenty of other hackathons this season, and it may not be too late to apply for those. Checkout{' '}
    <Link to="https://mlh.io/events" external>
      MLH&apos;s website
    </Link>{' '}
    to find out more information.
  </Status>
);

export default Rejected;
