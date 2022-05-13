import React from 'react';
import { Route, Routes } from 'react-router-dom';

import NotFound from '../pages/NotFound';
import Layout from './components/Layout';
import { ApplicationDetail, ListApplications } from './pages/applications';
import { MessageDetail, MessageEdit, MessageNew, MessagesList } from './pages/messages';
import { SchoolDetail, SchoolList } from './pages/schools';

const Organizers = (): JSX.Element => (
  <Layout>
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
  </Layout>
);

export default Organizers;
