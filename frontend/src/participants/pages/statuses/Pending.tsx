import Bugsnag from '@bugsnag/js';
import React from 'react';

import Link from '../../../components/Link';
import Status from '../../components/Status';

const Pending = (): JSX.Element => (
  <Status kind="pending" title="Submitted!">
    We&apos;ve received your application, and you&apos;ll receive an update in the coming weeks. In the meantime, why
    not follow us on{' '}
    <Link to="https://www.instagram.com/waffle.hacks" external>
      Instagram
    </Link>
    ,{' '}
    <Link to="" external>
      Facebook
    </Link>
    , and{' '}
    <Link to="https://twitter.com/WaffleHacks" external>
      Twitter
    </Link>{' '}
    to keep up-to-date with the latest information.
    <button onClick={() => Bugsnag.notify(new Error('test error'))}>Error</button>
  </Status>
);

export default Pending;
