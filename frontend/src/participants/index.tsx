import { useAuth0 } from '@auth0/auth0-react';
import { CheckCircleIcon, DocumentTextIcon, RefreshIcon, XCircleIcon } from '@heroicons/react/outline';
import React, { ReactNode, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import Card from '../components/Card';
import Link from '../components/Link';
import NotFound from '../pages/NotFound';
import { Status, useGetApplicationQuery } from '../store';
import Layout from './components/Layout';

const Application = React.lazy(() => import('./pages/application/Application'));
const SwagProgress = React.lazy(() => import('./pages/swag-progress/SwagProgress'));
const StatusDescription = React.lazy(() => import('./pages/StatusDescription'));

interface BaseProps {
  children: ReactNode;
  accepted: boolean;
}

const Base = ({ children, accepted }: BaseProps): JSX.Element => (
  <Layout accepted={accepted}>
    <Suspense fallback={<>Loading...</>}>
      <Routes>
        {children}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </Layout>
);

const SingleRoute = ({ children, accepted }: BaseProps): JSX.Element => (
  <Base accepted={accepted}>
    <Route index element={children} />
  </Base>
);

const Participants = (): JSX.Element => {
  const { user, isLoading: isUserLoading } = useAuth0();
  const { data: application, isLoading, isError, refetch } = useGetApplicationQuery(user?.sub || '');

  if (isLoading || isUserLoading) {
    return (
      <Layout accepted={false}>
        <Card className="flex justify-around">
          <RefreshIcon className="h-8 w-8 animate-spin" />
        </Card>
      </Layout>
    );
  }

  // No application submitted
  if (isError)
    return (
      <SingleRoute accepted={false}>
        <Application refetch={refetch} />
      </SingleRoute>
    );

  // Change view based on status
  switch (application?.status) {
    case Status.Pending:
      return (
        <SingleRoute accepted={false}>
          <StatusDescription icon={DocumentTextIcon} color="yellow" title="Submitted!">
            We&apos;ve received your application, and you&apos;ll receive an update in the coming weeks. In the
            meantime, why not follow us on{' '}
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
          </StatusDescription>
        </SingleRoute>
      );
    case Status.Rejected:
      return (
        <SingleRoute accepted={false}>
          <StatusDescription icon={XCircleIcon} color="red" title="Your application was rejected">
            It is with our sincerest regret to inform you that our admissions committee has chosen to not accept your
            application. We invite you to apply again next year.
            <br />
            <br />
            There are plenty of other hackathons this season, and it may not be too late to apply for those. Checkout{' '}
            <Link to="https://mlh.io/events" external>
              MLH&apos;s website
            </Link>{' '}
            to find out more information.
          </StatusDescription>
        </SingleRoute>
      );
    case Status.Accepted:
      // TODO: add other participant-facing pages
      const description = (
        <StatusDescription icon={CheckCircleIcon} color="green" title="Congratulations, you're in!">
          We look forward to seeing what project you build.
          <br />
          <br />
          Don&apos;t forget to join our{' '}
          <Link to="https://discord.gg/xDkwbAqU55" external>
            Discord
          </Link>{' '}
          to receive announcements, participate in workshops, and connect with other participants!
        </StatusDescription>
      );
      return (
        <Base accepted={true}>
          <Route index element={description} />
          <Route path="/swag" element={<SwagProgress />} />
        </Base>
      );
    default:
      throw new Error(`unknown status '${application?.status}'`);
  }
};

export default Participants;
