import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import authenticationReducer from './authentication';
import errorLogger from './errors';
import profileApi from './profile';
import registrationApi from './registration';

export const store = configureStore({
  reducer: {
    authentication: authenticationReducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [registrationApi.reducerPath]: registrationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(profileApi.middleware).concat(registrationApi.middleware).concat(errorLogger),
});

// Trigger re-fetches upon reconnection and upon regaining focus
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;

// Re-export actions and hooks
export { setProfileToken, setPortalToken, logout } from './authentication';
export { useDispatch, useSelector } from './hooks';
export { useGetProfileQuery } from './profile';
export {
  useCreateApplicationMutation,
  useGetApplicationQuery,
  useGetAutosaveQuery,
  useSetAutosaveMutation,
} from './registration';
export { ProfileScope, PortalScope } from './scopes';
export { highestPermission, isDirector, waitingForTokens } from './selectors';
export type { ApplicationAutosave } from './types';
export { Gender, RaceEthnicity } from './types';
