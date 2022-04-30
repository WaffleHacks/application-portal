import { DocumentTextIcon, HomeIcon, MenuIcon, UserGroupIcon } from '@heroicons/react/outline';
import React, { ReactNode, useState } from 'react';
import { useMatch } from 'react-router-dom';

import { NavItem } from '../../components/navigation';
import Navigation from './Navigation';

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Participants', href: '/participants', icon: UserGroupIcon },
  { name: 'Applications', href: '/applications', icon: DocumentTextIcon },
];

interface Props {
  children: ReactNode;
}

const Layout = ({ children }: Props): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  const match = useMatch(window.location.pathname);
  const titles = navigation.filter((item) => item.href === match?.pathname);
  const title = titles.length > 0 ? titles[0].name : 'Not found';

  return (
    <div className="min-h-full">
      <Navigation items={navigation} isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setIsOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
