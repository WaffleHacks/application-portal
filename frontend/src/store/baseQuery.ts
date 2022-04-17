import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { RootState } from './index';

const baseQuery = (token: 'profile' | 'portal', baseUrl: string) =>
  fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const t = state.authentication[token];
      if (t) headers.set('Authorization', `Bearer ${t.token}`);
      return headers;
    },
  });

export default baseQuery;
