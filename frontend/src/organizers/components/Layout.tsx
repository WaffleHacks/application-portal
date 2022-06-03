import {
  CalendarIcon,
  CheckCircleIcon,
  DotsCircleHorizontalIcon,
  HomeIcon,
  LibraryIcon,
  MailOpenIcon,
  MenuIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  XCircleIcon,
} from '@heroicons/react/outline';
import { ChartBarIcon } from '@heroicons/react/solid';
import React, { ReactNode, useState } from 'react';

import { NavItem, usePageTitle } from '../../components/navigation';
import Navigation, { NavSection } from './Navigation';

const navigation: NavSection[] = [
  {
    id: 'general',
    items: [
      { name: 'Dashboard', href: '/', icon: HomeIcon, exact: true },
      { name: 'Messages', href: '/messages', icon: MailOpenIcon },
      { name: 'Schools', href: '/schools', icon: LibraryIcon },
    ],
  },
  {
    id: 'applications',
    name: 'Applications',
    items: [
      { name: 'Pending', href: '/applications/pending', icon: DotsCircleHorizontalIcon },
      { name: 'Accepted', href: '/applications/accepted', icon: CheckCircleIcon },
      { name: 'Rejected', href: '/applications/rejected', icon: XCircleIcon },
      { name: 'Incomplete', href: '/applications/incomplete', icon: QuestionMarkCircleIcon },
    ],
  },
  {
    id: 'swag',
    name: 'Swag',
    items: [
      { name: 'Events', href: '/events', icon: CalendarIcon },
      { name: 'Tiers', href: '/swag/tiers', icon: ChartBarIcon },
      { name: 'Progress', href: '/swag/progress', icon: UserGroupIcon },
    ],
  },
];
const paths: NavItem[] = navigation.flatMap((s) => s.items);

interface Props {
  children: ReactNode;
}

const Layout = ({ children }: Props): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const title = usePageTitle(paths);

  return (
    <div className="min-h-full">
      <Navigation sections={navigation} isOpen={isOpen} setIsOpen={setIsOpen} />

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
