import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { decodeJwt } from 'jose';

import { PortalScope, ProfileScope } from './scopes';

const getPermissions = <Scope>(token: string): Scope[] => {
  const claims = decodeJwt(token);
  if (!claims.permissions || !Array.isArray(claims.permissions)) return [];

  return claims.permissions;
};

interface Token<Scope> {
  token: string;
  permissions: Scope[];
}

interface AuthenticationState {
  profile?: Token<ProfileScope>;
  portal?: Token<PortalScope>;
}

const initialState: AuthenticationState = {};

export const slice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    setProfileToken: (state, action: PayloadAction<string>) => {
      state.profile = {
        token: action.payload,
        permissions: getPermissions<ProfileScope>(action.payload),
      };
    },
    setPortalToken: (state, action: PayloadAction<string>) => {
      state.portal = {
        token: action.payload,
        permissions: getPermissions<PortalScope>(action.payload),
      };
    },
    logout: (state) => {
      state.portal = undefined;
      state.profile = undefined;
    },
  },
});

export default slice.reducer;
export const { setProfileToken, setPortalToken, logout } = slice.actions;
