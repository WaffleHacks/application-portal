import { useAuth0 } from '@auth0/auth0-react';
import React, { useEffect } from 'react';

import Loading from './Loading';
import { PortalScope, highestPermission, setPortalToken, setProfileToken, useDispatch, useSelector } from './store';

const Participants = React.lazy(() => import('./participants'));
const Organizers = React.lazy(() => import('./organizers'));

// From https://github.com/auth0/auth0-react/blob/88f82318a1dbe1372dd1653aec5bd609ccd8a301/src/utils.tsx#L3-L9
const CODE_RE = /[?&]code=[^&]+/;
const STATE_RE = /[?&]state=[^&]/;
const ERROR_RE = /[?&]error=[^&]/;

const hasAuthParams = (searchParams = window.location.search): boolean =>
  (CODE_RE.test(searchParams) || ERROR_RE.test(searchParams)) && STATE_RE.test(searchParams);

const App = (): JSX.Element => {
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const dispatch = useDispatch();
  const permission = useSelector(highestPermission);
  const portalTokenLoading = useSelector((state) => state.authentication.portal === undefined);

  useEffect(() => {
    (async () => {
      if (isLoading || hasAuthParams()) return;
      else if (!isAuthenticated) await loginWithRedirect();

      // Get tokens for the application portal and profile services
      getAccessTokenSilently({ audience: 'https://apply.wafflehacks.org' }).then((token) =>
        dispatch(setPortalToken(token)),
      );
      getAccessTokenSilently({ audience: 'https://id.wafflehacks.org' }).then((token) =>
        dispatch(setProfileToken(token)),
      );
    })();
  }, [isLoading, isAuthenticated]);

  if (isLoading || !isAuthenticated || portalTokenLoading || !permission) return <Loading />;

  switch (permission) {
    case PortalScope.Participant:
      return <Participants />;
    case PortalScope.Sponsor:
      console.log('Not yet implemented');
      return <></>;
    case PortalScope.Organizer:
      return <Organizers />;
    default:
      throw new Error('Unknown permission level');
  }
};

export default App;
