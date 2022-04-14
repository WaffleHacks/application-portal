import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import authenticationReducer from './authentication';

export const store = configureStore({
  reducer: {
    authentication: authenticationReducer,
  },
});

// Trigger re-fetches upon reconnection and upon regaining focus
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;

// Re-export actions and hooks
export { setProfileToken, setPortalToken, logout } from './authentication';
export { useDispatch, useSelector } from './hooks';
export { ProfileScope, PortalScope } from './scopes';
export { hasPermission, waitingForTokens } from './selectors';
