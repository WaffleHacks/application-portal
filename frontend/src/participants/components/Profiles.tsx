import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';

import { ProfilePicture } from '../../components/navigation';
import { useGetProfileQuery } from '../../store';

const logoutOptions = {
  client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
  returnTo: window.location.origin,
};

const DesktopProfile = (): JSX.Element => {
  const { data } = useGetProfileQuery();

  return <>{data === undefined ? 'Loading...' : data.firstName + ' ' + data.lastName}</>;
};

const MobileProfile = (): JSX.Element => {
  const { logout } = useAuth0();
  const { data } = useGetProfileQuery();

  return (
    <>
      <div className="flex items-center px-4">
        <div className="flex-shrink-0">
          <ProfilePicture />
        </div>
        <div className="ml-3 text-base font-medium text-gray-800">
          {data === undefined ? 'Loading...' : data.firstName + ' ' + data.lastName}
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <button
          type="button"
          onClick={() => logout(logoutOptions)}
          className="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
        >
          Log out
        </button>
      </div>
    </>
  );
};

export { DesktopProfile, MobileProfile };
