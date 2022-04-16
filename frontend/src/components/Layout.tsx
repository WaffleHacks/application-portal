import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { useMatch } from 'react-router-dom';

import Navigation, { NavItem } from './Navigation';

const navigation: NavItem[] = [
  { name: 'Application', href: '/' },
  { name: 'Profile', href: 'https://id.wafflehacks.org', external: true },
];

interface Props {
  className?: string;
  children: ReactNode;
}

const Layout = ({ className, children }: Props): JSX.Element => {
  const match = useMatch(window.location.pathname);
  const titles = navigation.filter((item) => item.href == match?.pathname);
  const title = titles.length > 0 ? titles[0].name : 'Not found';

  return (
    <div className={classNames(className, 'min-h-full')}>
      <Navigation items={navigation} />

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Your {title}</h1>
          </div>
        </header>
        <main className="pt-3">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
