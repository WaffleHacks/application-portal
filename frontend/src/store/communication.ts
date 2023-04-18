import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { Group, Message, MessageTrigger, ReducedMessage, TriggerType } from './types';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Tags used for caching
 */
enum Tag {
  Message = 'message',
  Trigger = 'trigger',
}

type MessageCreate = Pick<Message, 'subject' | 'content'> & { recipients: Group[] };

type MessageUpdate = Partial<MessageCreate> & Partial<Pick<Message, 'status'>> & Pick<Message, 'id'>;

interface MessageTriggerSet {
  type: TriggerType;
  message_id: number | null;
}

const api = createApi({
  reducerPath: 'communication',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, credentials: 'include' }),
  tagTypes: Object.values(Tag),
  endpoints: (builder) => ({
    // Messages endpoints
    listMessages: builder.query<ReducedMessage[], void>({
      query: () => '/communication/messages/',
      providesTags: (result: ReducedMessage[] = []) => [
        Tag.Message,
        ...result.map((m) => ({ type: Tag.Message, id: m.id })),
      ],
    }),
    getMessage: builder.query<Message, string>({
      query: (id) => `/communication/messages/${id}`,
      providesTags: (result: Message | undefined) => (result ? [{ type: Tag.Message, id: result.id }] : []),
    }),
    createMessage: builder.mutation<Message, MessageCreate>({
      query: (body) => ({
        url: '/communication/messages/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [Tag.Message],
    }),
    updateMessage: builder.mutation<Message, MessageUpdate>({
      query: ({ id, ...body }) => ({
        url: `/communication/messages/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: Tag.Message, id }],
    }),
    deleteMessage: builder.mutation<void, number>({
      query: (id) => ({
        url: `/communication/messages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: Tag.Message, id }],
    }),
    sendMessage: builder.mutation<void, number>({
      query: (id) => ({
        url: `/communication/messages/${id}/send`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: Tag.Message, id }],
    }),
    sendTestMessage: builder.mutation<void, number>({
      query: (id) => ({
        url: `/communication/messages/${id}/test`,
        method: 'POST',
      }),
    }),

    // Message trigger endpoints
    listMessageTriggers: builder.query<MessageTrigger[], void>({
      query: () => '/communication/triggers/',
      providesTags: (result: MessageTrigger[] = []) => [
        Tag.Trigger,
        ...result.map((t) => ({ type: Tag.Trigger, id: t.trigger })),
      ],
    }),
    setMessageTrigger: builder.mutation<void, MessageTriggerSet>({
      query: ({ type, ...body }) => ({
        url: `/communication/triggers/${type}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { type }) => [{ type: Tag.Trigger, id: type }],
    }),
    testMessageTrigger: builder.mutation<void, TriggerType>({
      query: (type) => ({
        url: `/communication/triggers/${type}`,
        method: 'POST',
      }),
    }),
  }),
});

export default api;
export const {
  useListMessagesQuery,
  useGetMessageQuery,
  useCreateMessageMutation,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
  useSendMessageMutation,
  useSendTestMessageMutation,
  useListMessageTriggersQuery,
  useSetMessageTriggerMutation,
  useTestMessageTriggerMutation,
} = api;
