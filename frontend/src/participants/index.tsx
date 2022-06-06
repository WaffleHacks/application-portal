import { useAuth0 } from '@auth0/auth0-react';
import { RefreshIcon } from '@heroicons/react/outline';
import React, { ReactNode, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import Card from '../components/Card';
import NotFound from '../pages/NotFound';
import { ApplicationStatus, useGetApplicationQuery } from '../store';
import Layout from './components/Layout';

const Application = React.lazy(() => import('./pages/application/Application'));
const Attendance = React.lazy(() => import('./pages/attendance/Attendance'));
const SwagProgress = React.lazy(() => import('./pages/swag-progress/SwagProgress'));

const AcceptedStatus = React.lazy(() => import('./pages/statuses/Accepted'));
const PendingStatus = React.lazy(() => import('./pages/statuses/Pending'));
const RejectedStatus = React.lazy(() => import('./pages/statuses/Rejected'));

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
      <Base accepted={false}>
        <Route index element={<Application refetch={refetch} />} />
      </Base>
    );

  // Change view based on status
  switch (application?.status) {
    case ApplicationStatus.Pending:
      return (
        <Base accepted={false}>
          <Route index element={<PendingStatus />} />
        </Base>
      );
    case ApplicationStatus.Rejected:
      return (
        <Base accepted={false}>
          <Route index element={<RejectedStatus />} />
        </Base>
      );
    case ApplicationStatus.Accepted:
      return (
        <Base accepted={true}>
          <Route index element={<AcceptedStatus />} />
          <Route path="/swag" element={<SwagProgress />} />
          <Route path="/workshop/:code" element={<Attendance />} />
        </Base>
      );
    default:
      throw new Error(`unknown status '${application?.status}'`);
  }
};

export default Participants;
