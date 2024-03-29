import React, { lazy } from 'react';

import Loading from './Loading';
import { useCurrentUserQuery } from './store';
import { AuthenticationStatus, Role } from './store/types';

const Login = lazy(() => import('./authentication/Login'));
const CompleteProfile = lazy(() => import('./authentication/CompleteProfile'));
const Participants = lazy(() => import('./participants'));
const Organizers = lazy(() => import('./organizers'));

const App = (): JSX.Element => {
  const { data, isLoading } = useCurrentUserQuery();

  if (isLoading || !data) return <Loading />;

  switch (data.status) {
    case AuthenticationStatus.Unauthenticated:
    case AuthenticationStatus.OAuth:
      return <Login />;
    case AuthenticationStatus.IncompleteProfile:
      return <CompleteProfile />;
    case AuthenticationStatus.Authenticated:
      switch (data.participant?.role) {
        case Role.Participant:
          return <Participants />;
        case Role.Sponsor:
          console.log('Not yet implemented');
          return <></>;
        case Role.Organizer:
          return <Organizers />;
        default:
          throw new Error(`Unknown permission level: ${data.participant?.role}`);
      }
    default:
      throw new Error(`Unknown authentication status: ${data.status}`);
  }
};

export default App;
