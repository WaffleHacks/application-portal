import classNames from 'classnames';
import React, { ReactNode } from 'react';

import { usePageTitle } from 'components/navigation';

import Navigation, { NavItem } from './Navigation';

const navigation: NavItem[] = [
  { name: 'Your Application', href: '/', exact: true },
  { name: 'Swag Progress', href: '/swag', acceptedOnly: true },
  { name: 'Profile', href: '/profile' },
  { name: 'Workshop Attendance', href: '/workshop/', acceptedOnly: true, hidden: true },
];

interface Props {
  accepted: boolean;
  className?: string;
  children: ReactNode;
}

const Layout = ({ accepted, className, children }: Props): JSX.Element => {
  const title = usePageTitle(navigation, (item: NavItem) => !item.acceptedOnly || accepted);

  return (
    <div className={classNames(className, 'min-h-full')}>
      <Navigation accepted={accepted} items={navigation} />

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">{title}</h1>
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
