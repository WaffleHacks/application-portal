import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { ReducedWebhook, Webhook, WebhookWithSecret } from './types';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Tags used for caching
 */
enum Tag {
  Webhook = 'webhook',
}

type WebhookCreate = Omit<WebhookWithSecret, 'id'>;

type WebhookUpdate = Partial<WebhookWithSecret>;

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
  }),
});

export default api;
export const {
  useListWebhooksQuery,
  useGetWebhookQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
} = api;
