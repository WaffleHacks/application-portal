import { createApi } from '@reduxjs/toolkit/query/react';

import baseQuery from './baseQuery';
import type { Application, ApplicationAutosave, ReducedApplication, School } from './types';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Tags used for caching
 */
enum Tag {
  Application = 'application',
  School = 'school',
}

type ApplicationCreate = Omit<Application, 'created_at' | 'participant' | 'resume' | 'school' | 'status'> & {
  resume: boolean;
  school: string;
};

interface ApplicationCreateResponse {
  upload?: {
    url: string;
    fields: Record<string, string>;
  };
}

interface SchoolDetail extends School {
  applications: ReducedApplication[];
}

const api = createApi({
  reducerPath: 'registration',
  baseQuery: baseQuery('portal', BASE_URL),
  tagTypes: Object.values(Tag),
  endpoints: (builder) => ({
    listApplications: builder.query<ReducedApplication[], void>({
      query: () => '/registration/applications/',
      providesTags: (result: ReducedApplication[] = []) => [
        Tag.Application,
        ...result.map((a) => ({ type: Tag.Application, id: a.participant.id })),
      ],
    }),
    getApplication: builder.query<Application, string>({
      query: (arg) => `/registration/applications/${arg}`,
      providesTags: (result: Application | undefined) =>
        result ? [{ type: Tag.Application, id: result.participant.id }] : [],
    }),
    createApplication: builder.mutation<ApplicationCreateResponse, ApplicationCreate>({
      query: (body) => ({
        url: '/registration/applications/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [Tag.Application],
    }),

    // Application autosave endpoints
    // These do not have caching enabled to prevent constant fetches and re-fetches
    getAutosave: builder.query<ApplicationAutosave, void>({
      query: () => '/registration/applications/autosave',
    }),
    setAutosave: builder.mutation<void, ApplicationAutosave>({
      query: (body) => ({
        url: '/registration/applications/autosave',
        method: 'PUT',
        body,
      }),
    }),

    // School endpoints
    getSchool: builder.query<SchoolDetail, string>({
      query: (id) => `/registration/schools/${id}`,
      providesTags: (result: SchoolDetail | undefined) => (result ? [{ type: Tag.School, id: result.id }] : []),
    }),
  }),
});

export default api;
export const {
  useCreateApplicationMutation,
  useGetApplicationQuery,
  useListApplicationsQuery,
  useGetAutosaveQuery,
  useSetAutosaveMutation,
  useGetSchoolQuery,
} = api;
