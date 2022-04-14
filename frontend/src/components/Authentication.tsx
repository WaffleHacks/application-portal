import { useAuth0 } from '@auth0/auth0-react';
import { RefreshIcon } from '@heroicons/react/outline';
import React, { ReactNode, useEffect } from 'react';

import { useSetTokens } from '../tokens';
import Layout from './Layout';

// From https://github.com/auth0/auth0-react/blob/88f82318a1dbe1372dd1653aec5bd609ccd8a301/src/utils.tsx#L3-L9
const CODE_RE = /[?&]code=[^&]+/;
const STATE_RE = /[?&]state=[^&]/;
const ERROR_RE = /[?&]error=[^&]/;

const hasAuthParams = (searchParams = window.location.search): boolean =>
  (CODE_RE.test(searchParams) || ERROR_RE.test(searchParams)) && STATE_RE.test(searchParams);

interface Props {
  children: ReactNode;
}

const Authentication = ({ children }: Props): JSX.Element => {
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const { profileToken, portalToken, setProfileToken, setPortalToken } = useSetTokens();

  useEffect(() => {
    (async () => {
      if (isLoading || hasAuthParams()) return;
      else if (!isAuthenticated) await loginWithRedirect();

      // Get tokens for the application portal and profile services
      const [resolvedPortal, resolvedProfile] = await Promise.all([
        getAccessTokenSilently({
          audience: 'https://apply.wafflehacks.tech',
        }),
        getAccessTokenSilently({
          audience: 'https://id.wafflehacks.org',
        }),
      ]);
      setPortalToken(resolvedPortal);
      setProfileToken(resolvedProfile);
    })();
  }, [isLoading, isAuthenticated]);

  if (isLoading || !isAuthenticated || portalToken === '' || profileToken === '') {
    return (
      <div className="h-screen flex">
        <div className="m-auto">
          <RefreshIcon className="w-16 h-16 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return <Layout>{children}</Layout>;
};

export default Authentication;
