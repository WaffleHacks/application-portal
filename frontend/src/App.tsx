import { useAuth0 } from '@auth0/auth0-react';
import { RefreshIcon } from '@heroicons/react/outline';
import React, { useEffect } from 'react';

import Organizers from './organizers';
import Participants from './participants';
import {
  PortalScope,
  highestPermission,
  setPortalToken,
  setProfileToken,
  useDispatch,
  useSelector,
  waitingForTokens,
} from './store';

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
  const tokensLoading = useSelector(waitingForTokens);

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

  if (isLoading || !isAuthenticated || tokensLoading || !permission) {
    return (
      <div className="h-screen flex">
        <div className="m-auto">
          <div className="flex justify-center">
            <RefreshIcon className="w-16 h-16 rounded-full animate-spin" />
          </div>
          <p className="text-gray-700 text-center mt-5">Loading copious amounts of JavaScript...</p>
        </div>
      </div>
    );
  }

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
