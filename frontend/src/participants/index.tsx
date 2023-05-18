import { ArrowPathIcon } from '@heroicons/react/24/outline';
import React, { ReactNode, Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import Card from '../components/Card';
import NotFound from '../pages/NotFound';
import { ApplicationStatus, useCurrentUserQuery, useGetApplicationQuery } from '../store';

const Application = lazy(() => import('./pages/application/Application'));
const Attendance = lazy(() => import('./pages/attendance/Attendance'));
const SwagProgress = lazy(() => import('./pages/swag-progress/SwagProgress'));

const AcceptedStatus = lazy(() => import('./pages/statuses/Accepted'));
const PendingStatus = lazy(() => import('./pages/statuses/Pending'));
const RejectedStatus = lazy(() => import('./pages/statuses/Rejected'));

const Profile = lazy(() => import('./pages/Profile'));

interface BaseProps {
  children: ReactNode;
  accepted: boolean;
}

const Base = ({ children, accepted }: BaseProps): JSX.Element => (
  <Layout accepted={accepted}>
    <Suspense fallback={<>Loading...</>}>
      <Routes>
        {children}
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </Layout>
);

const Participants = (): JSX.Element => {
  const { data: user, isLoading: isUserLoading } = useCurrentUserQuery();
  const { data: application, isLoading, isError, refetch } = useGetApplicationQuery(user?.participant?.id || 0);

  if (isLoading || isUserLoading) {
    return (
      <Layout accepted={false}>
        <Card className="flex justify-around">
          <ArrowPathIcon className="h-8 w-8 animate-spin" />
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
