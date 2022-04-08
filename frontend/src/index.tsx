import React from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App';
import Layout from './components/Layout';

const root = document.getElementById('root') as Element;
createRoot(root).render(
  <React.StrictMode>
    <Layout>
      <App />
    </Layout>
  </React.StrictMode>,
);
