import { Middleware, isRejectedWithValue } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Send toasts for RTK query errors
 * @param skip the endpoints to skip error handling for
 */
const errorLogger =
  (skip: string[] = []): Middleware =>
  () =>
  (next) =>
  (action) => {
    // Handle RTK query errors
    if (isRejectedWithValue(action) && action.payload.status !== 404) {
      const endpoint = action.meta.arg.endpointName;
      if (skip.includes(endpoint)) return next(action);

      const status = action.payload.status;

      if (status === 401) toast.error('Invalid session. Please try logging out and back in.');
      else if (status === 403) toast.error('You are not authorized to access this resource.');
      else if (action.payload.data.reason) toast.error(capitalize(action.payload.data.reason));
      else toast.error('An unexpected error occurred, please try again later');
    }

    return next(action);
  };

export default errorLogger;
