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

interface Counts {
  pending: number;
  accepted: number;
  rejected: number;
}

const api = createApi({
  reducerPath: 'statistics',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, credentials: 'include' }),
  tagTypes: [],
  endpoints: (builder) => ({
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
    getParticipantCountsByStatus: builder.query<Counts, void>({
      query: () => '/statistics/registration/',
    }),
  }),
});

export default api;
export const {
  useGetRegistrationStatisticsQuery,
  useGetPerDayRegistrationStatisticsQuery,
  useGetSchoolStatisticsQuery,
  useGetParticipantCountsByStatusQuery,
} = api;
