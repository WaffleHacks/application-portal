import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';

import { RootState } from './index';

const BASE_URL = process.env.REACT_APP_PROFILES_BASE_URL || '';

interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const api = createApi({
  reducerPath: 'profile',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders(headers, { getState }) {
      const state = getState() as RootState;
      if (state.authentication.profile) headers.set('Authorization', `Bearer ${state.authentication.profile.token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getProfile: builder.query<Profile, void>({
      query: () => '/profile',
    }),
  }),
});

export default api;
export const { useGetProfileQuery } = api;
