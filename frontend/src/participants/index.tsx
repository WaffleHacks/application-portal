import React from 'react';
import { Route, Routes } from 'react-router-dom';

import NotFound from '../pages/NotFound';
import Layout from './components/Layout';
import { Application } from './pages/application';
import Status from './pages/Status';

const Participants = (): JSX.Element => (
  <Layout>
    <Routes>
      <Route index element={<Status />} />
      <Route path="/new" element={<Application />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Layout>
);

export default Participants;
