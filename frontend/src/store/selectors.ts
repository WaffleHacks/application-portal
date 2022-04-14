import { createSelector } from '@reduxjs/toolkit';

import { RootState } from './index';
import { PortalScope } from './scopes';

type Selector<S> = (state: RootState) => S;

/**
 * Check if the current token has the required permission
 * @param scope the permission to check
 */
export const hasPermission = (scope: PortalScope): Selector<boolean> =>
  createSelector([(state: RootState) => state.authentication.portal], (portal) =>
    portal ? portal.permissions.indexOf(scope) !== -1 : false,
  );

/**
 * Check if we are still waiting for tokens to be retrieved
 */
export const waitingForTokens = createSelector(
  [(state: RootState) => state.authentication],
  (auth) => auth.portal === undefined && auth.profile === undefined,
);
