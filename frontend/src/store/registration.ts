import { createApi } from '@reduxjs/toolkit/query/react';

import { SchoolDetail } from '../organizers/pages/schools';
import baseQuery from './baseQuery';
import type { Application, ApplicationAutosave, Participant, ReducedApplication, School, SchoolList } from './types';
import { ApplicationStatus } from './types';

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

interface UpdateApplicationStatus {
  id: string;
  status: ApplicationStatus;
}

type SchoolCreate = Omit<School, 'id' | 'applications'>;

type SchoolUpdate = Partial<SchoolCreate> & Pick<School, 'id'>;

interface ApplicationResume {
  url: string;
}

interface BulkSetApplicationStatus {
  status: ApplicationStatus;
  ids: string[];
}

interface MergeSchools {
  from: string;
  into: string;
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
    setApplicationStatus: builder.mutation<void, UpdateApplicationStatus>({
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
    getSchool: builder.query<School, string>({
      query: (id) => `/registration/schools/${id}`,
      providesTags: (result: School | undefined) => (result ? [{ type: Tag.School, id: result.id }] : []),
    }),
    createSchool: builder.mutation<void, SchoolCreate>({
      query: (body) => ({
        url: `/registration/schools/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [Tag.School],
    }),
    updateSchool: builder.mutation<void, SchoolUpdate>({
      query: ({ id, ...body }) => ({
        url: `/registration/schools/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: Tag.School, id }],
    }),
    mergeSchools: builder.mutation<void, MergeSchools>({
      query: (body) => ({
        url: '/registration/schools/merge',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { from, into }) => [
        { type: Tag.School, id: from },
        { type: Tag.School, id: into },
      ],
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
  useUpdateSchoolMutation,
  useMergeSchoolsMutation,
} = api;
