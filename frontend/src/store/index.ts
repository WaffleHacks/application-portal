import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import authenticationReducer from './authentication';
import communicationApi from './communication';
import errorLogger from './errors';
import profileApi from './profile';
import registrationApi from './registration';

export const store = configureStore({
  reducer: {
    authentication: authenticationReducer,
    [communicationApi.reducerPath]: communicationApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [registrationApi.reducerPath]: registrationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(communicationApi.middleware)
      .concat(profileApi.middleware)
      .concat(registrationApi.middleware)
      .concat(errorLogger),
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
export { useGetProfileQuery } from './profile';
export {
  useCreateApplicationMutation,
  useGetApplicationQuery,
  useListApplicationsQuery,
  useGetAutosaveQuery,
  useSetAutosaveMutation,
  useListSchoolsQuery,
  useGetSchoolQuery,
} from './registration';
export { ProfileScope, PortalScope } from './scopes';
export { highestPermission, isDirector, waitingForTokens } from './selectors';
export type { ApplicationAutosave, ReducedApplication } from './types';
export { Gender, RaceEthnicity } from './types';
