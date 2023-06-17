import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import NotFound from '../pages/NotFound';
import { ApplicationStatus } from '../store';

const Dashboard = lazy(() => import('./pages/dashboard'));
const ApplicationDetail = lazy(() => import('./pages/applications/Detail'));
const ListApplicationsByStatus = lazy(() => import('./pages/applications/StatusList'));
const ListIncompleteApplications = lazy(() => import('./pages/applications/IncompleteList'));
const ListPendingApplications = lazy(() => import('./pages/applications/PendingList'));
const EventDetail = lazy(() => import('./pages/events/Detail'));
const EventEdit = lazy(() => import('./pages/events/Edit'));
const EventFeedback = lazy(() => import('./pages/events/Feedback'));
const ListEvents = lazy(() => import('./pages/events/List'));
const EventNew = lazy(() => import('./pages/events/New'));
const CheckIns = lazy(() => import('./pages/check-ins/CheckIns'));
const ExportList = lazy(() => import('./pages/exports/List'));
const NewExport = lazy(() => import('./pages/exports/New'));
const MessageDetail = lazy(() => import('./pages/messages/Detail'));
const MessageEdit = lazy(() => import('./pages/messages/Edit'));
const MessageNew = lazy(() => import('./pages/messages/New'));
const MessagesList = lazy(() => import('./pages/messages/List'));
const ProviderDetail = lazy(() => import('./pages/admin/providers/Detail'));
const ProviderEdit = lazy(() => import('./pages/admin/providers/Edit'));
const ProvidersList = lazy(() => import('./pages/admin/providers/List'));
const NewProvider = lazy(() => import('./pages/admin/providers/New'));
const SchoolDetail = lazy(() => import('./pages/schools/Detail'));
const SchoolEdit = lazy(() => import('./pages/schools/Edit'));
const SchoolList = lazy(() => import('./pages/schools/List'));
const NewSchool = lazy(() => import('./pages/schools/New'));
const SchoolMerge = lazy(() => import('./pages/schools/Merge'));
const SwagProgress = lazy(() => import('./pages/swag/Progress'));
const SwagTierDetail = lazy(() => import('./pages/swag/tiers/Detail'));
const SwagTierEdit = lazy(() => import('./pages/swag/tiers/Edit'));
const ListSwagTiers = lazy(() => import('./pages/swag/tiers/List'));
const SwagTierNew = lazy(() => import('./pages/swag/tiers/New'));
const Settings = lazy(() => import('./pages/settings'));
const UserEdit = lazy(() => import('./pages/admin/users/Edit'));
const UserList = lazy(() => import('./pages/admin/users/List'));
const WebhookDetail = lazy(() => import('./pages/webhooks/Detail'));
const WebhookEdit = lazy(() => import('./pages/webhooks/Edit'));
const WebhookList = lazy(() => import('./pages/webhooks/List'));
const NewWebhook = lazy(() => import('./pages/webhooks/New'));

const Organizers = (): JSX.Element => (
  <Layout>
    <Suspense fallback={<>Loading...</>}>
      <Routes>
        <Route index element={<Dashboard />} />

        <Route path="/applications/pending" element={<ListPendingApplications />} />
        <Route
          path="/applications/accepted"
          element={<ListApplicationsByStatus status={ApplicationStatus.Accepted} />}
        />
        <Route
          path="/applications/rejected"
          element={<ListApplicationsByStatus status={ApplicationStatus.Rejected} />}
        />
        <Route path="/applications/incomplete" element={<ListIncompleteApplications />} />
        <Route path="/applications/:id" element={<ApplicationDetail />} />

        <Route path="/events" element={<ListEvents />} />
        <Route path="/events/new" element={<EventNew />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/events/:eventId/feedback/:participantId" element={<EventFeedback />} />
        <Route path="/events/:id/edit" element={<EventEdit />} />

        <Route path="/check-ins" element={<CheckIns />} />

        <Route path="/schools" element={<SchoolList />} />
        <Route path="/schools/new" element={<NewSchool />} />
        <Route path="/schools/merge" element={<SchoolMerge />} />
        <Route path="/schools/:id" element={<SchoolDetail />} />
        <Route path="/schools/:id/edit" element={<SchoolEdit />} />

        <Route path="/swag/progress" element={<SwagProgress />} />

        <Route path="/swag/tiers" element={<ListSwagTiers />} />
        <Route path="/swag/tiers/new" element={<SwagTierNew />} />
        <Route path="/swag/tiers/:id" element={<SwagTierDetail />} />
        <Route path="/swag/tiers/:id/edit" element={<SwagTierEdit />} />

        <Route path="/messages" element={<MessagesList />} />
        <Route path="/messages/new" element={<MessageNew />} />
        <Route path="/messages/:id" element={<MessageDetail />} />
        <Route path="/messages/:id/edit" element={<MessageEdit />} />

        <Route path="/settings" element={<Settings />} />

        <Route path="/providers" element={<ProvidersList />} />
        <Route path="/providers/new" element={<NewProvider />} />
        <Route path="/providers/:slug" element={<ProviderDetail />} />
        <Route path="/providers/:slug/edit" element={<ProviderEdit />} />

        <Route path="/users" element={<UserList />} />
        <Route path="/users/:id/edit" element={<UserEdit />} />

        <Route path="/exports" element={<ExportList />} />
        <Route path="/exports/new" element={<NewExport />} />

        <Route path="/webhooks" element={<WebhookList />} />
        <Route path="/webhooks/new" element={<NewWebhook />} />
        <Route path="/webhooks/:id" element={<WebhookDetail />} />
        <Route path="/webhooks/:id/edit" element={<WebhookEdit />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </Layout>
);

export default Organizers;
