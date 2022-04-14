import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import authenticationReducer from './authentication';
import profileApi from './profile';

export const store = configureStore({
  reducer: {
    authentication: authenticationReducer,
    [profileApi.reducerPath]: profileApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(profileApi.middleware),
});

// Trigger re-fetches upon reconnection and upon regaining focus
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;

// Re-export actions and hooks
export { setProfileToken, setPortalToken, logout } from './authentication';
export { useDispatch, useSelector } from './hooks';
export { useGetProfileQuery } from './profile';
export { ProfileScope, PortalScope } from './scopes';
export { hasPermission, waitingForTokens } from './selectors';
