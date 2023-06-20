import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { SchoolStatisticEntry, StatisticEntry } from './types';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export type RegistrationStatistic =
  | 'age'
  | 'experience'
  | 'graduation-year'
  | 'country'
  | 'gender'
  | 'level-of-study'
  | 'major'
  | 'race-ethnicity';

interface PerDayArgs {
  start?: string;
  end?: string;
}

interface ApplicationCounts {
  pending: number;
  accepted: number;
  rejected: number;
}

interface CheckInCounts {
  yes: number;
  no: number;
}

const api = createApi({
  reducerPath: 'statistics',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, credentials: 'include' }),
  tagTypes: [],
  endpoints: (builder) => ({
    // Registration statistics
    getRegistrationStatistics: builder.query<StatisticEntry[], RegistrationStatistic>({
      query: (kind) => `/statistics/registration/${kind}`,
    }),
    getPerDayRegistrationStatistics: builder.query<StatisticEntry[], PerDayArgs>({
      query: (params) => ({
        url: '/statistics/registration/per-day',
        params,
      }),
    }),
    getSchoolStatistics: builder.query<SchoolStatisticEntry[], void>({
      query: () => '/statistics/registration/school',
    }),
    getParticipantCountsByStatus: builder.query<ApplicationCounts, void>({
      query: () => '/statistics/registration/',
    }),

    // Check-in statistics
    getCheckInStatistics: builder.query<CheckInCounts, void>({
      query: () => '/statistics/check-in',
    }),
  }),
});

export default api;
export const {
  useGetRegistrationStatisticsQuery,
  useGetPerDayRegistrationStatisticsQuery,
  useGetSchoolStatisticsQuery,
  useGetParticipantCountsByStatusQuery,
  useGetCheckInStatisticsQuery,
} = api;
