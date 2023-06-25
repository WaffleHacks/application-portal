import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import authenticationApi from './authentication';
import communicationApi from './communication';
import errorLogger from './errors';
import integrationsApi from './integrations';
import operationsApi from './operations';
import registrationApi from './registration';
import statisticsApi from './statistics';
import workshopsApi from './workshops';

export const store = configureStore({
  reducer: {
    [authenticationApi.reducerPath]: authenticationApi.reducer,
    [communicationApi.reducerPath]: communicationApi.reducer,
    [integrationsApi.reducerPath]: integrationsApi.reducer,
    [operationsApi.reducerPath]: operationsApi.reducer,
    [registrationApi.reducerPath]: registrationApi.reducer,
    [statisticsApi.reducerPath]: statisticsApi.reducer,
    [workshopsApi.reducerPath]: workshopsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authenticationApi.middleware)
      .concat(communicationApi.middleware)
      .concat(integrationsApi.middleware)
      .concat(operationsApi.middleware)
      .concat(registrationApi.middleware)
      .concat(statisticsApi.middleware)
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
export {
  useListWebhooksQuery,
  useGetWebhookQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
  useListExportsQuery,
  useGetExportDownloadUrlQuery,
  useInitiateExportMutation,
  useGetJudgingUploadUrlQuery,
  useGetJudgingHeadersListQuery,
  useInitiateJudgingDataProcessMutation,
  useGetJudgingDataProcessingStatusQuery,
  useGetJudgingProcessResultQuery,
} from './integrations';
export {
  useGetSettingsQuery,
  useSetAcceptingApplicationsSettingMutation,
  useSetCheckInStartSettingMutation,
  useSetCheckInEndSettingMutation,
} from './operations';
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
  useCheckInParticipantMutation,
  useListCheckedInParticipantsQuery,
} from './registration';
export type { RegistrationStatistic } from './statistics';
export {
  useGetRegistrationStatisticsQuery,
  useGetPerDayRegistrationStatisticsQuery,
  useGetSchoolStatisticsQuery,
  useGetParticipantCountsByStatusQuery,
  useGetCheckInStatisticsQuery,
} from './statistics';
export type {
  ApplicationAutosave,
  ReducedApplication,
  Export,
  ReducedMessage,
  School,
  SchoolList,
  ParticipantWithSwag,
  ReducedSwagTier,
  SwagTier,
  Participant,
  ReducedEvent,
  Feedback,
  MessageTrigger,
  Webhook,
  ReducedWebhook,
  StatisticEntry,
  SchoolStatisticEntry,
  UploadPreSignedUrl,
  JudgingUpload,
} from './types';
export {
  ExportStatus,
  Gender,
  Group,
  RaceEthnicity,
  ApplicationStatus,
  MessageStatus,
  WebhookFormat,
  WebhookTriggers,
} from './types';
export {
  useGetEventAttendanceQuery,
  useGetFeedbackStatusQuery,
  useSubmitFeedbackMutation,
  useListEventsQuery,
  useGetEventQuery,
  useGetEventByCodeQuery,
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
