import React from 'react';
import { Route, Routes } from 'react-router-dom';

import NotFound from '../pages/NotFound';
import Layout from './components/Layout';
import { ListApplications } from './pages/applications';

const Organizers = (): JSX.Element => (
  <Layout>
    <Routes>
      <Route path="/applications" element={<ListApplications />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Layout>
);

export default Organizers;
