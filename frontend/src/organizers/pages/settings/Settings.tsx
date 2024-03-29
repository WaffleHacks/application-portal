import React from 'react';

import { Description, UpdatableSection } from 'organizers/components/description';
import Loading from 'organizers/components/Loading';
import { useGetSettingsQuery } from 'store';

import AcceptingApplicationsToggle from './AcceptingApplicationsToggle';
import { CheckInEndItem, CheckInStartItem } from './CheckInItems';

const Settings = (): JSX.Element => {
  const { data: settings, isLoading } = useGetSettingsQuery();

  if (isLoading || settings === undefined) return <Loading />;

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700">Manage the global settings for the hackathon.</p>
        </div>
      </div>

      <Description title="Registration">
        <UpdatableSection>
          <AcceptingApplicationsToggle value={settings.accepting_applications} />
        </UpdatableSection>
      </Description>

      <Description title="Check-in">
        <UpdatableSection>
          <CheckInStartItem value={settings.checkin_start} />
          <CheckInEndItem value={settings.checkin_end} />
        </UpdatableSection>
      </Description>
    </>
  );
};

export default Settings;
