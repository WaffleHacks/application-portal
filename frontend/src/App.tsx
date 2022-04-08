import { useAuth0 } from '@auth0/auth0-react';
import { RefreshIcon } from '@heroicons/react/outline';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';

import Layout from './components/Layout';
import AppBase from './Placeholder';

const App = (): JSX.Element => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const [loginTimer, setLoginTimer] = useState<NodeJS.Timeout>();

  const loading = isLoading || !isAuthenticated;

  // TODO: figure out a better way to require login w/o user interaction
  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && loginTimer) clearTimeout(loginTimer);
    else if (!loginTimer) setLoginTimer(setTimeout(() => loginWithRedirect(), 1000));
  }, [isLoading, isAuthenticated, loginTimer]);

  return (
    <>
      <div className={classNames({ hidden: !loading }, 'h-screen flex')}>
        <div className="m-auto">
          <RefreshIcon className="w-16 h-16 rounded-full animate-spin" />
        </div>
      </div>
      <Layout className={loading ? 'hidden' : ''}>
        <AppBase />
      </Layout>
    </>
  );
};

export default App;
