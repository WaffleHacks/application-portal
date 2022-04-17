import { createApi } from '@reduxjs/toolkit/query/react';

import baseQuery from './baseQuery';
import type { Profile } from './types';

const BASE_URL = process.env.REACT_APP_PROFILES_BASE_URL || '';

const api = createApi({
  reducerPath: 'profile',
  baseQuery: baseQuery('profile', BASE_URL),
  endpoints: (builder) => ({
    getProfile: builder.query<Profile, void>({
      query: () => '/profile',
    }),
  }),
});

export default api;
export const { useGetProfileQuery } = api;
