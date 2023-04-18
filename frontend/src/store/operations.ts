import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { ServiceSettings } from './types';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Tags used for caching
 */
enum Tag {
  Setting = 'setting',
}

const api = createApi({
  reducerPath: 'operations',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, credentials: 'include' }),
  tagTypes: Object.values(Tag),
  endpoints: (builder) => ({
    // Settings endpoints
    getSettings: builder.query<ServiceSettings, void>({
      query: () => '/operations/settings/',
      providesTags: [Tag.Setting],
    }),
    setAcceptingApplicationsSetting: builder.mutation<void, boolean>({
      query: (value) => ({
        url: '/operations/settings/accepting_applications',
        method: 'PUT',
        body: {
          value,
        },
      }),
      invalidatesTags: [Tag.Setting],
    }),
  }),
});

export default api;
export const { useGetSettingsQuery, useSetAcceptingApplicationsSettingMutation } = api;
