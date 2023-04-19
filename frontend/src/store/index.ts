import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import authenticationApi from './authentication';
import communicationApi from './communication';
import errorLogger from './errors';
import operationsApi from './operations';
import registrationApi from './registration';
import workshopsApi from './workshops';

export const store = configureStore({
  reducer: {
    [authenticationApi.reducerPath]: authenticationApi.reducer,
    [communicationApi.reducerPath]: communicationApi.reducer,
    [operationsApi.reducerPath]: operationsApi.reducer,
    [registrationApi.reducerPath]: registrationApi.reducer,
    [workshopsApi.reducerPath]: workshopsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authenticationApi.middleware)
      .concat(communicationApi.middleware)
      .concat(operationsApi.middleware)
      .concat(registrationApi.middleware)
      .concat(workshopsApi.middleware)
      .concat(errorLogger(['markAttendance'])),
});

// Trigger re-fetches upon reconnection and upon regaining focus
setupListeners(store.dispatch);

// Re-export actions and hooks
export {
  useCurrentUserQuery,
  useCompleteProfileMutation,
  useUpdateProfileMutation,
  useListProvidersQuery,
  useGetProviderQuery,
  useCreateProviderMutation,
  useUpdateProviderMutation,
  useDeleteProviderMutation,
} from './authentication';
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
export { useGetSettingsQuery, useSetAcceptingApplicationsSettingMutation } from './operations';
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
  useListParticipantsQuery,
  useGetParticipantQuery,
  useUpdateParticipantPermissionsMutation,
} from './registration';
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
