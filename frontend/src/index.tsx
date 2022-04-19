import { Auth0Provider } from '@auth0/auth0-react';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import 'flatpickr/dist/flatpickr.min.css';
import './index.css';

import Authentication from './components/Authentication';
import { Application } from './pages/application';
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
        audience="https://apply.wafflehacks.tech"
        useRefreshTokens
      >
        <BrowserRouter>
          <Authentication>
            <Routes>
              <Route path="/new" element={<Application />} />
            </Routes>
          </Authentication>
        </BrowserRouter>
      </Auth0Provider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
);
