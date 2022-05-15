import { Auth0Provider } from '@auth0/auth0-react';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import 'flatpickr/dist/flatpickr.min.css';
import './index.css';

import App from './App';
import Loading from './Loading';
import { store } from './store';

const AUTH0_DOMAIN = process.env.REACT_APP_AUTH0_DOMAIN || '';
const AUTH0_CLIENT_ID = process.env.REACT_APP_AUTH0_CLIENT_ID || '';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Auth0Provider
        domain={AUTH0_DOMAIN}
        clientId={AUTH0_CLIENT_ID}
        redirectUri={window.location.origin}
        cacheLocation="localstorage"
        audience="https://apply.wafflehacks.org"
        useRefreshTokens
      >
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
          <Suspense fallback={<Loading />}>
            <App />
          </Suspense>
        </BrowserRouter>
      </Auth0Provider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
);
