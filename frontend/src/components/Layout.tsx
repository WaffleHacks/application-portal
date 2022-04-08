import React, { ReactNode } from 'react';

import Navigation from './Navigation';

interface Props {
  children: ReactNode;
}

const Layout = ({ children }: Props): JSX.Element => (
  <div className="min-h-full">
    <Navigation />

    <div className="py-10">
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main className="pt-3">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  </div>
);

export default Layout;
