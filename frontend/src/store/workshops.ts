import { createApi } from '@reduxjs/toolkit/query/react';

import baseQuery from './baseQuery';
import { Event, Feedback, ParticipantWithSwag, ReducedEvent, ReducedSwagTier, SwagTier } from './types';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Tags used for caching
 */
enum Tag {
  Event = 'event',
  Feedback = 'feedback',
  SwagProgress = 'swag-progress',
  SwagTier = 'swag-tier',
}

interface FeedbackSubmit extends Omit<Feedback, 'participant' | 'event'> {
  code: string;
}

interface FeedbackStatus {
  submitted: boolean;
}

type EventCreate = Pick<Event, 'name' | 'valid_from' | 'valid_until'>;

interface EventUpdate extends EventCreate {
  id: string;
  enabled: boolean;
}

type SwagTierCreate = Omit<SwagTier, 'id' | 'participants'>;

type SwagTierUpdate = Omit<SwagTier, 'participants'>;

interface SwagProgress {
  attended: number;
  current_tier: number | null;
  tiers: Omit<SwagTier, 'participants'>[];
}

interface DetailedFeedbackRequest {
  event_id: string;
  participant_id: string;
}

const api = createApi({
  reducerPath: 'workshops',
  baseQuery: baseQuery('portal', BASE_URL),
  tagTypes: Object.values(Tag),
  endpoints: (builder) => ({
    // Attendance endpoints
    markAttendance: builder.mutation<void, string>({
      query: (code) => ({
        url: `/workshops/attendance/${code}`,
        method: 'PUT',
      }),
    }),
    getFeedbackStatus: builder.query<boolean, string>({
      query: (code) => `/workshops/attendance/${code}/feedback`,
      providesTags: [Tag.Feedback],
      transformResponse: (resp: FeedbackStatus) => resp.submitted,
    }),
    submitFeedback: builder.mutation<void, FeedbackSubmit>({
      query: ({ code, ...body }) => ({
        url: `/workshops/attendance/${code}/feedback`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [Tag.Feedback],
    }),

    // Events endpoints
    listEvents: builder.query<ReducedEvent[], void>({
      query: () => '/workshops/events/',
      providesTags: (result: ReducedEvent[] = []) => [Tag.Event, ...result.map((e) => ({ type: Tag.Event, id: e.id }))],
    }),
    getEvent: builder.query<Event, string>({
      query: (id) => `/workshops/events/${id}`,
      providesTags: (result, error, arg) => [{ type: Tag.Event, id: arg }],
    }),
    getDetailedEventFeedback: builder.query<Feedback, DetailedFeedbackRequest>({
      query: ({ event_id, participant_id }) => `/workshops/events/${event_id}/feedback/${participant_id}`,
      providesTags: (result, error, { participant_id }) => [{ type: Tag.Feedback, id: participant_id }],
    }),
    createEvent: builder.mutation<void, EventCreate>({
      query: (body) => ({
        url: '/workshops/events/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [Tag.Event],
    }),
    updateEvent: builder.mutation<void, EventUpdate>({
      query: ({ id, ...body }) => ({
        url: `/workshops/events/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: Tag.Event, id }],
    }),
    deleteEvent: builder.mutation<void, number>({
      query: (id) => ({
        url: `/workshops/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [Tag.Event, { type: Tag.Event, id }],
    }),

    // Swag endpoints
    getSwagProgress: builder.query<SwagProgress, void>({
      query: () => '/workshops/swag/progress',
      providesTags: [Tag.SwagProgress],
    }),
    getAllParticipantSwagProgress: builder.query<ParticipantWithSwag[], void>({
      query: () => '/workshops/swag/participants',
      providesTags: [Tag.SwagProgress],
    }),

    // Swag tiers endpoints
    listSwagTiers: builder.query<ReducedSwagTier[], void>({
      query: () => '/workshops/swag/tiers/',
      providesTags: (result: ReducedSwagTier[] = []) => [
        Tag.SwagTier,
        ...result.map((s) => ({ type: Tag.SwagTier, id: s.id })),
      ],
    }),
    getSwagTier: builder.query<SwagTier, string>({
      query: (id) => `/workshops/swag/tiers/${id}`,
      providesTags: (result, error, id) => [{ type: Tag.SwagTier, id }],
    }),
    createSwagTier: builder.mutation<void, SwagTierCreate>({
      query: (body) => ({
        url: '/workshops/swag/tiers/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [Tag.SwagTier],
    }),
    updateSwagTier: builder.mutation<void, SwagTierUpdate>({
      query: ({ id, ...body }) => ({
        url: `/workshops/swag/tiers/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: Tag.SwagTier, id }],
    }),
    deleteSwagTier: builder.mutation<void, string>({
      query: (id) => ({
        url: `/workshops/swag/tiers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [Tag.SwagTier, { type: Tag.SwagTier, id }],
    }),
  }),
});

export default api;
export const {
  useMarkAttendanceMutation,
  useGetFeedbackStatusQuery,
  useSubmitFeedbackMutation,
  useListEventsQuery,
  useGetEventQuery,
  useGetDetailedEventFeedbackQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetSwagProgressQuery,
  useGetAllParticipantSwagProgressQuery,
  useListSwagTiersQuery,
  useGetSwagTierQuery,
  useCreateSwagTierMutation,
  useUpdateSwagTierMutation,
  useDeleteSwagTierMutation,
} = api;
