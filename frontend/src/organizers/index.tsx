import React from 'react';
import { Route, Routes } from 'react-router-dom';

import NotFound from '../pages/NotFound';
import Layout from './components/Layout';
import { ApplicationDetail, ListApplications } from './pages/applications';
import { SchoolDetail } from './pages/schools';

const Organizers = (): JSX.Element => (
  <Layout>
    <Routes>
      <Route path="/applications" element={<ListApplications />} />
      <Route path="/applications/:id" element={<ApplicationDetail />} />
      <Route path="/schools/:id" element={<SchoolDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Layout>
);

export default Organizers;
