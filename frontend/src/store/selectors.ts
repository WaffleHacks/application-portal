import { createSelector } from '@reduxjs/toolkit';

import { RootState } from './index';
import { PortalScope } from './scopes';

const permissionHierarchy = [PortalScope.Organizer, PortalScope.Sponsor, PortalScope.Participant];

/**
 * Get the highest permission of the current user
 */
export const highestPermission = createSelector([(state: RootState) => state.authentication.portal], (portal) => {
  const permissions = portal?.permissions || [];
  for (const permission of permissionHierarchy) if (permissions.indexOf(permission) !== -1) return permission;

  return undefined;
});

/**
 * Determine if the current user is a director
 */
export const isDirector = createSelector(
  [(state: RootState) => state.authentication.portal],
  (portal) => (portal?.permissions || []).indexOf(PortalScope.Director) !== -1,
);
