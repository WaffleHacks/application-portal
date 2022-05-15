import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import NotFound from '../pages/NotFound';
import Layout from './components/Layout';

const ApplicationDetail = React.lazy(() => import('./pages/applications/Detail'));
const ListApplications = React.lazy(() => import('./pages/applications/List'));
const MessageDetail = React.lazy(() => import('./pages/messages/Detail'));
const MessageEdit = React.lazy(() => import('./pages/messages/Edit'));
const MessageNew = React.lazy(() => import('./pages/messages/New'));
const MessagesList = React.lazy(() => import('./pages/messages/List'));
const SchoolDetail = React.lazy(() => import('./pages/schools/Detail'));
const SchoolList = React.lazy(() => import('./pages/schools/List'));

const Organizers = (): JSX.Element => (
  <Layout>
    <Suspense fallback={<>Loading...</>}>
      <Routes>
        <Route path="/applications" element={<ListApplications />} />
        <Route path="/applications/:id" element={<ApplicationDetail />} />

        <Route path="/schools" element={<SchoolList />} />
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
