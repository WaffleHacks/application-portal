import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { AuthenticationStatus, Participant, Provider, ProviderWithClientSecret, ReducedProvider } from './types';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Tags used for caching
 */
enum Tag {
  Profile = 'profile',
  Provider = 'provider',
}

interface Me {
  status: AuthenticationStatus;
  email: string | null;
  participant: Participant | null;
}

interface ProfileCreate {
  first_name: string;
  last_name: string;
}

type ProfileUpdate = Partial<ProfileCreate>;

type ProviderCreate = ProviderWithClientSecret;

type ProviderUpdate = Partial<Omit<ProviderWithClientSecret, 'slug'>> & Pick<ProviderWithClientSecret, 'slug'>;

const api = createApi({
  reducerPath: 'authentication',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, credentials: 'include' }),
  tagTypes: Object.values(Tag),
  endpoints: (builder) => ({
    // User endpoints
    currentUser: builder.query<Me, void>({
      query: () => ({ url: '/auth/me' }),
      providesTags: () => [Tag.Profile],
    }),
    completeProfile: builder.mutation<Participant, ProfileCreate>({
      query: (body) => ({
        url: '/auth/profile/complete',
        method: 'POST',
        body,
      }),
      invalidatesTags: () => [Tag.Profile],
    }),
    updateProfile: builder.mutation<Participant, ProfileUpdate>({
      query: (body) => ({
        url: '/auth/profile/',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: () => [Tag.Profile],
    }),

    // Provider endpoints
    listProviders: builder.query<ReducedProvider[], void>({
      query: () => '/auth/providers/',
      providesTags: (result: ReducedProvider[] = []) => [
        Tag.Provider,
        ...result.map((p) => ({ type: Tag.Provider, id: p.slug })),
      ],
    }),
    getProvider: builder.query<Provider, string>({
      query: (slug) => `/auth/providers/${slug}`,
      providesTags: (result: Provider | undefined) => (result ? [{ type: Tag.Provider, id: result.slug }] : []),
    }),
    createProvider: builder.mutation<Provider, ProviderCreate>({
      query: (body) => ({
        url: '/auth/providers/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [Tag.Provider],
    }),
    updateProvider: builder.mutation<Provider, ProviderUpdate>({
      query: ({ slug, ...body }) => ({
        url: `/auth/providers/${slug}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { slug }) => [{ type: Tag.Provider, id: slug }],
    }),
    deleteProvider: builder.mutation<void, string>({
      query: (slug) => ({
        url: `/auth/providers/${slug}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, slug) => [Tag.Provider, { type: Tag.Provider, id: slug }],
    }),
  }),
});

export default api;
export const {
  useCurrentUserQuery,
  useCompleteProfileMutation,
  useUpdateProfileMutation,
  useListProvidersQuery,
  useGetProviderQuery,
  useCreateProviderMutation,
  useUpdateProviderMutation,
  useDeleteProviderMutation,
} = api;
