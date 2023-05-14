import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import React from 'react';

import { LinkButton } from 'components/buttons';
import Status from 'participants/components/Status';

const Accepted = (): JSX.Element => (
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
);

export default Accepted;
