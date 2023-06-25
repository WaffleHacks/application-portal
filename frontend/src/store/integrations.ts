import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { Export, JudgingUpload, ReducedWebhook, Webhook, WebhookWithSecret } from './types';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Tags used for caching
 */
enum Tag {
  Webhook = 'webhook',
  Export = 'export',
}

type WebhookCreate = Omit<WebhookWithSecret, 'id'>;

type WebhookUpdate = Partial<WebhookWithSecret>;

interface DownloadUrl {
  url: string;
}

interface ExportCreate {
  name: string;
  table: string;
  kind: string;
}

interface JudgingProcess {
  file: string;

  name: string;
  url: string;
  project_status: string;
  judging_status: string;
  submission_code: string;
}

interface JudgingProcessingStatus {
  status: 'pending' | 'success' | 'failure';
}

type JudgingProcessResult = JudgingProcessSuccessResult | JudgingProcessFailureResult;

interface JudgingProcessSuccessResult {
  status: 'success';
  valid: string;
  invalid: string;
}

interface JudgingProcessFailureResult {
  status: 'failure';
  reason: string;
}

const api = createApi({
  reducerPath: 'integrations',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, credentials: 'include' }),
  tagTypes: Object.values(Tag),
  endpoints: (builder) => ({
    // Webhook endpoints
    listWebhooks: builder.query<ReducedWebhook[], void>({
      query: () => '/integrations/webhooks/',
      providesTags: (result: ReducedWebhook[] = []) => [
        Tag.Webhook,
        ...result.map((w) => ({ type: Tag.Webhook, id: w.id })),
      ],
    }),
    getWebhook: builder.query<Webhook, string>({
      query: (id) => `/integrations/webhooks/${id}`,
      providesTags: (result: Webhook | undefined) => (result ? [{ type: Tag.Webhook, id: result.id }] : []),
    }),
    createWebhook: builder.mutation<Webhook, WebhookCreate>({
      query: (body) => ({
        url: '/integrations/webhooks/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [Tag.Webhook],
    }),
    updateWebhook: builder.mutation<void, WebhookUpdate>({
      query: ({ id, ...body }) => ({
        url: `/integrations/webhooks/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: Tag.Webhook, id }],
    }),
    deleteWebhook: builder.mutation<void, string>({
      query: (id) => ({
        url: `/integrations/webhooks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: Tag.Webhook, id }],
    }),

    // Export endpoints
    listExports: builder.query<Export[], void>({
      query: () => '/integrations/exports/',
      providesTags: [Tag.Export],
    }),
    getExportDownloadUrl: builder.query<DownloadUrl, number>({
      query: (id) => `/integrations/exports/${id}/download`,
    }),
    initiateExport: builder.mutation<void, ExportCreate>({
      query: (body) => ({
        url: '/integrations/exports/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [Tag.Export],
    }),

    // Judging endpoints
    getJudgingUploadUrl: builder.query<JudgingUpload, void>({
      query: () => '/integrations/judging/upload',
    }),
    getJudgingHeadersList: builder.query<string[], string>({
      query: (file) => `/integrations/judging/${file}/headers`,
    }),
    initiateJudgingDataProcess: builder.mutation<void, JudgingProcess>({
      query: ({ file, ...body }) => ({
        url: `/integrations/judging/${file}/process`,
        method: 'PUT',
        body,
      }),
    }),
    getJudgingDataProcessingStatus: builder.query<JudgingProcessingStatus, string>({
      query: (file) => `/integrations/judging/${file}/process`,
    }),
    getJudgingProcessResult: builder.query<JudgingProcessResult, string>({
      query: (file) => `/integrations/judging/${file}/result`,
    }),
  }),
});

export default api;
export const {
  useListWebhooksQuery,
  useGetWebhookQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
  useListExportsQuery,
  useGetExportDownloadUrlQuery,
  useInitiateExportMutation,
  useGetJudgingUploadUrlQuery,
  useGetJudgingHeadersListQuery,
  useInitiateJudgingDataProcessMutation,
  useGetJudgingDataProcessingStatusQuery,
  useGetJudgingProcessResultQuery,
} = api;
