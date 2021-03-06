import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import authenticationReducer from './authentication';
import communicationApi from './communication';
import errorLogger from './errors';
import operationsApi from './operations';
import profileApi from './profile';
import registrationApi from './registration';
import workshopsApi from './workshops';

export const store = configureStore({
  reducer: {
    authentication: authenticationReducer,
    [communicationApi.reducerPath]: communicationApi.reducer,
    [operationsApi.reducerPath]: operationsApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [registrationApi.reducerPath]: registrationApi.reducer,
    [workshopsApi.reducerPath]: workshopsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(communicationApi.middleware)
      .concat(operationsApi.middleware)
      .concat(profileApi.middleware)
      .concat(registrationApi.middleware)
      .concat(workshopsApi.middleware)
      .concat(errorLogger(['markAttendance'])),
});

// Trigger re-fetches upon reconnection and upon regaining focus
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;

// Re-export actions and hooks
export { setProfileToken, setPortalToken, logout } from './authentication';
export {
  useListMessagesQuery,
  useGetMessageQuery,
  useCreateMessageMutation,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
  useSendMessageMutation,
  useSendTestMessageMutation,
  useListMessageTriggersQuery,
  useSetMessageTriggerMutation,
  useTestMessageTriggerMutation,
} from './communication';
export { useDispatch, useSelector } from './hooks';
export { useGetSettingsQuery, useSetAcceptingApplicationsSettingMutation } from './operations';
export { useGetProfileQuery } from './profile';
export {
  useCreateApplicationMutation,
  useGetApplicationQuery,
  useGetApplicationResumeQuery,
  useListApplicationsQuery,
  useListIncompleteApplicationsQuery,
  useUpdateApplicationMutation,
  useSetApplicationStatusMutation,
  useGetAutosaveQuery,
  useSetAutosaveMutation,
  useBulkSetApplicationStatusMutation,
  useListSchoolsQuery,
  useGetSchoolQuery,
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useMergeSchoolsMutation,
} from './registration';
export { ProfileScope, PortalScope } from './scopes';
export { highestPermission, isDirector } from './selectors';
export type {
  ApplicationAutosave,
  ReducedApplication,
  ReducedMessage,
  School,
  SchoolList,
  ParticipantWithSwag,
  ReducedSwagTier,
  SwagTier,
  Participant,
  ReducedEvent,
  ReducedFeedback,
  MessageTrigger,
} from './types';
export { Gender, Group, RaceEthnicity, ApplicationStatus, MessageStatus } from './types';
export {
  useMarkAttendanceMutation,
  useGetFeedbackStatusQuery,
  useSubmitFeedbackMutation,
  useListEventsQuery,
  useGetEventQuery,
  useGetDetailedEventFeedbackQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetSwagProgressQuery,
  useGetAllParticipantSwagProgressQuery,
  useListSwagTiersQuery,
  useGetSwagTierQuery,
  useCreateSwagTierMutation,
  useUpdateSwagTierMutation,
  useDeleteSwagTierMutation,
} from './workshops';
