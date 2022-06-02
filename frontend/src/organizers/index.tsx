import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import NotFound from '../pages/NotFound';
import { Status } from '../store';
import Layout from './components/Layout';

const ApplicationDetail = React.lazy(() => import('./pages/applications/Detail'));
const ListApplicationsByStatus = React.lazy(() => import('./pages/applications/StatusList'));
const ListIncompleteApplications = React.lazy(() => import('./pages/applications/IncompleteList'));
const ListPendingApplications = React.lazy(() => import('./pages/applications/PendingList'));
const EventDetail = React.lazy(() => import('./pages/events/Detail'));
const ListEvents = React.lazy(() => import('./pages/events/List'));
const EventNew = React.lazy(() => import('./pages/events/New'));
const MessageDetail = React.lazy(() => import('./pages/messages/Detail'));
const MessageEdit = React.lazy(() => import('./pages/messages/Edit'));
const MessageNew = React.lazy(() => import('./pages/messages/New'));
const MessagesList = React.lazy(() => import('./pages/messages/List'));
const SchoolDetail = React.lazy(() => import('./pages/schools/Detail'));
const SchoolList = React.lazy(() => import('./pages/schools/List'));
const NewSchool = React.lazy(() => import('./pages/schools/New'));

const Organizers = (): JSX.Element => (
  <Layout>
    <Suspense fallback={<>Loading...</>}>
      <Routes>
        <Route path="/applications/pending" element={<ListPendingApplications />} />
        <Route path="/applications/accepted" element={<ListApplicationsByStatus status={Status.Accepted} />} />
        <Route path="/applications/rejected" element={<ListApplicationsByStatus status={Status.Rejected} />} />
        <Route path="/applications/incomplete" element={<ListIncompleteApplications />} />
        <Route path="/applications/:id" element={<ApplicationDetail />} />

        <Route path="/events" element={<ListEvents />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/events/new" element={<EventNew />} />

        <Route path="/schools" element={<SchoolList />} />
        <Route path="/schools/new" element={<NewSchool />} />
        <Route path="/schools/:id" element={<SchoolDetail />} />

        <Route path="/messages" element={<MessagesList />} />
        <Route path="/messages/new" element={<MessageNew />} />
        <Route path="/messages/:id" element={<MessageDetail />} />
        <Route path="/messages/:id/edit" element={<MessageEdit />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </Layout>
);

export default Organizers;
