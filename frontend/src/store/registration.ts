import { createApi } from '@reduxjs/toolkit/query/react';

import baseQuery from './baseQuery';
import type { Application, ApplicationAutosave, Participant, ReducedApplication, School } from './types';
import { Status } from './types';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Tags used for caching
 */
enum Tag {
  Application = 'application',
  Participant = 'participant',
  School = 'school',
}

type ApplicationCreate = Omit<Application, 'created_at' | 'participant' | 'resume' | 'school' | 'status' | 'notes'> & {
  resume: boolean;
  school: string;
};

interface ApplicationCreateResponse {
  upload?: {
    url: string;
    fields: Record<string, string>;
  };
}

type ApplicationUpdate = Partial<Omit<Application, 'participant' | 'created_at' | 'resume' | 'school'>> & {
  id: string;
};

interface ApplicationStatus {
  id: string;
  status: Status;
}

interface SchoolList extends School {
  count: number;
}

interface SchoolDetail extends School {
  applications: ReducedApplication[];
}

interface SchoolCreate extends Omit<School, 'id'> {
  abbreviations: string[];
  alternatives: string[];
}

interface ApplicationResume {
  url: string;
}

interface BulkSetApplicationStatus {
  status: Status;
  ids: string[];
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
    listIncompleteApplications: builder.query<Participant[], void>({
      query: () => '/registration/applications/incomplete',
      providesTags: (result: Participant[] = []) => [
        Tag.Participant,
        ...result.map((i) => ({ type: Tag.Participant, id: i.id })),
      ],
    }),
    getApplication: builder.query<Application, string>({
      query: (arg) => `/registration/applications/${arg}`,
      providesTags: (result: Application | undefined) =>
        result ? [{ type: Tag.Application, id: result.participant.id }] : [],
    }),
    getApplicationResume: builder.query<ApplicationResume, string>({
      query: (arg) => `/registration/applications/${arg}/resume`,
    }),
    createApplication: builder.mutation<ApplicationCreateResponse, ApplicationCreate>({
      query: (body) => ({
        url: '/registration/applications/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [Tag.Application],
    }),
    updateApplication: builder.mutation<void, ApplicationUpdate>({
      query: ({ id, ...body }) => ({
        url: `/registration/applications/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: Tag.Application, id }],
    }),
    setApplicationStatus: builder.mutation<void, ApplicationStatus>({
      query: ({ id, ...body }) => ({
        url: `/registration/applications/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [Tag.Application, { type: Tag.Application, id }],
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

    // Bulk endpoints
    bulkSetApplicationStatus: builder.mutation<void, BulkSetApplicationStatus>({
      query: (body) => ({
        url: '/registration/bulk/status',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { ids }) => [
        Tag.Application,
        ...ids.map((id) => ({ type: Tag.Application, id })),
      ],
    }),

    // School endpoints
    listSchools: builder.query<SchoolList[], void>({
      query: () => '/registration/schools/',
      providesTags: (result: SchoolList[] = []) => [Tag.School, ...result.map((s) => ({ type: Tag.School, id: s.id }))],
    }),
    getSchool: builder.query<SchoolDetail, string>({
      query: (id) => `/registration/schools/${id}`,
      providesTags: (result: SchoolDetail | undefined) => (result ? [{ type: Tag.School, id: result.id }] : []),
    }),
    createSchool: builder.mutation<void, SchoolCreate>({
      query: (body) => ({
        url: `/registration/schools/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [Tag.School],
    }),
  }),
});

export default api;
export const {
  useCreateApplicationMutation,
  useGetApplicationQuery,
  useGetApplicationResumeQuery,
  useListApplicationsQuery,
  useListIncompleteApplicationsQuery,
  useUpdateApplicationMutation,
  useSetApplicationStatusMutation,
  useGetAutosaveQuery,
  useSetAutosaveMutation,
  useBulkSetApplicationStatusMutation,
  useListSchoolsQuery,
  useGetSchoolQuery,
  useCreateSchoolMutation,
} = api;
