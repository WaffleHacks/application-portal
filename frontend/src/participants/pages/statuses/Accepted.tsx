import React from 'react';

import Link from '../../../components/Link';
import Status from '../../components/Status';

const Accepted = (): JSX.Element => (
  <Status kind="success" title="Congratulations, you're in!">
    We look forward to seeing what project you build.
    <br />
    <br />
    Don&apos;t forget to join our{' '}
    <Link to="https://discord.gg/xDkwbAqU55" external>
      Discord
    </Link>{' '}
    to receive announcements, participate in workshops, and connect with other participants!
  </Status>
);

export default Accepted;
