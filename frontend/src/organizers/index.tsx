import React from 'react';
import { Route, Routes } from 'react-router-dom';

import NotFound from '../pages/NotFound';
import Layout from './components/Layout';

const Organizers = (): JSX.Element => (
  <Layout>
    <Routes>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Layout>
);

export default Organizers;
