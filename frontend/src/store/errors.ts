import { Middleware, isRejectedWithValue } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const errorLogger: Middleware = () => (next) => (action) => {
  // Handle RTK query errors
  if (isRejectedWithValue(action) && action.payload.status !== 404) {
    const status = action.payload.status;

    if (status === 401 || status === 403) toast('Invalid token. Please try logging out and back in.');
    else if (action.payload.data.reason) toast(capitalize(action.payload.data.reason));
    else toast('An unexpected error occurred, please try again later');
  }

  return next(action);
};

export default errorLogger;
