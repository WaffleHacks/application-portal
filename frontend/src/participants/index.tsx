import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import NotFound from '../pages/NotFound';
import Layout from './components/Layout';

const Application = React.lazy(() => import('./pages/application/Application'));
const Status = React.lazy(() => import('./pages/Status'));

const Participants = (): JSX.Element => (
  <Layout>
    <Suspense fallback={<>Loading...</>}>
      <Routes>
        <Route index element={<Status />} />
        <Route path="/new" element={<Application />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </Layout>
);

export default Participants;
