import React from 'react';

import { ProfilePicture } from '../../components/navigation';
import { useCurrentUserQuery } from '../../store';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const DesktopProfile = (): JSX.Element => {
  const { data } = useCurrentUserQuery();
  if (!data?.participant) return <>Loading...</>;

  return (
    <>
      {data.participant.first_name} {data.participant.last_name}
    </>
  );
};

const MobileProfile = (): JSX.Element => {
  const { data } = useCurrentUserQuery();

  return (
    <>
      <div className="flex items-center px-4">
        <div className="flex-shrink-0">
          <ProfilePicture />
        </div>
        <div className="ml-3 text-base font-medium text-gray-800">
          {!data?.participant ? 'Loading...' : data.participant.first_name + ' ' + data.participant.last_name}
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <a
          href={`${BASE_URL}/auth/logout`}
          className="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
        >
          Log out
        </a>
      </div>
    </>
  );
};

export { DesktopProfile, MobileProfile };
