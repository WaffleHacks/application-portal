import {
  Bars3Icon,
  BuildingLibraryIcon,
  CalendarIcon,
  CheckCircleIcon,
  CogIcon,
  DocumentArrowDownIcon,
  EllipsisHorizontalCircleIcon,
  EnvelopeOpenIcon,
  HomeIcon,
  LockClosedIcon,
  QuestionMarkCircleIcon,
  ShareIcon,
  UserGroupIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { ChartBarIcon } from '@heroicons/react/24/solid';
import React, { ReactNode, useState } from 'react';

import { NavItem, usePageTitle } from 'components/navigation';
import { useCurrentUserQuery } from 'store';

import Navigation, { NavSection } from './Navigation';

const navigation: NavSection[] = [
  {
    id: 'general',
    items: [
      { name: 'Dashboard', href: '/', icon: HomeIcon, exact: true },
      { name: 'Messages', href: '/messages', icon: EnvelopeOpenIcon },
      { name: 'Schools', href: '/schools', icon: BuildingLibraryIcon },
      { name: 'Settings', href: '/settings', icon: CogIcon },
    ],
  },
  {
    id: 'applications',
    name: 'Applications',
    items: [
      { name: 'Pending', href: '/applications/pending', icon: EllipsisHorizontalCircleIcon },
      { name: 'Accepted', href: '/applications/accepted', icon: CheckCircleIcon },
      { name: 'Rejected', href: '/applications/rejected', icon: XCircleIcon },
      { name: 'Incomplete', href: '/applications/incomplete', icon: QuestionMarkCircleIcon },
      { name: 'Applications', href: '/applications', hidden: true },
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
  {
    id: 'integrations',
    name: 'Integrations',
    items: [
      { name: 'Export Data', href: '/exports', icon: DocumentArrowDownIcon },
      { name: 'Webhooks', href: '/webhooks', icon: ShareIcon },
    ],
  },
  {
    id: 'admin',
    name: 'Admin',
    adminOnly: true,
    items: [
      { name: 'Providers', href: '/providers', icon: LockClosedIcon },
      { name: 'Users', href: '/users', icon: UserIcon },
    ],
  },
];
const paths: NavItem[] = navigation.flatMap((s) => s.items);

interface Props {
  children: ReactNode;
}

const Layout = ({ children }: Props): JSX.Element => {
  const { data: user } = useCurrentUserQuery();

  const [isOpen, setIsOpen] = useState(false);
  const title = usePageTitle(paths);

  const sections = navigation.filter((s) => !s.adminOnly || user?.participant?.is_admin);

  return (
    <div className="min-h-full">
      <Navigation sections={sections} isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setIsOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-layout mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="max-w-layout mx-auto px-4 sm:px-6 md:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
