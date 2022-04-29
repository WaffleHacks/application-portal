import { useAuth0 } from '@auth0/auth0-react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { MenuIcon, RefreshIcon, UserIcon, XIcon } from '@heroicons/react/outline';
import classNames from 'classnames';
import React, { Fragment } from 'react';
import { NavLink } from 'react-router-dom';

import logoTitle from '../../logo-title.png';
import logo from '../../logo.png';
import { useGetProfileQuery } from '../../store';

const AUTH0_CLIENT_ID = process.env.REACT_APP_AUTH0_CLIENT_ID;

export interface NavItem {
  name: string;
  href: string;
  external?: boolean;
  hidden?: boolean;
}

const ProfilePicture = (): JSX.Element => {
  const { isAuthenticated, user, isLoading } = useAuth0();

  if (isLoading) return <RefreshIcon className="h-8 w-8 rounded-full text-gray-500 animate-spin" />;
  else if (isAuthenticated && user?.picture)
    return <img className="h-8 w-8 rounded-full" src={user.picture} alt="profile picture" />;
  else return <UserIcon className="h-8 w-8 rounded-full text-gray-500" />;
};

const linkClassNames = (isActive: boolean, mobile: boolean): string => {
  if (mobile) {
    return classNames(
      isActive
        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800',
      'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
    );
  } else {
    return classNames(
      isActive
        ? 'border-indigo-500 text-gray-900'
        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
      'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
    );
  }
};

interface LinkProps {
  item: NavItem;
  mobile: boolean;
}

const Link = ({ item, mobile }: LinkProps): JSX.Element => {
  if (item.external) {
    return (
      <a href={item.href} className={linkClassNames(false, mobile)}>
        {item.name}
      </a>
    );
  } else {
    return (
      <NavLink to={item.href} className={({ isActive }) => linkClassNames(isActive, mobile)}>
        {item.name}
      </NavLink>
    );
  }
};

interface Props {
  items: NavItem[];
}

const Navigation = ({ items }: Props): JSX.Element => {
  const { logout } = useAuth0();
  const { data } = useGetProfileQuery();

  const logoutOptions = {
    client_id: AUTH0_CLIENT_ID,
    returnTo: window.location.origin,
  };

  const shownItems = items.filter((i) => !i.hidden);

  return (
    <Disclosure as="nav" className="bg-white shadow-sm">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <img className="block lg:hidden h-8 w-auto" src={logo} alt="WaffleHacks" />
                  <img className="hidden lg:block h-8 w-auto" src={logoTitle} alt="WaffleHacks" />
                </div>
                <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                  {shownItems.map((item) => (
                    <Link key={item.name} item={item} mobile={false} />
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <Menu as="div" className="ml-3 relative">
                  <div>
                    <Menu.Button className="bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <span className="sr-only">Open user menu</span>
                      <ProfilePicture />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        <span className="block px-4 py-2 text-sm text-gray-700 w-full text-left border-b border-gray-300">
                          {data?.firstName} {data?.lastName}
                        </span>
                      </Menu.Item>
                      <Menu.Item>
                        <button
                          type="button"
                          onClick={() => logout(logoutOptions)}
                          className="block px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-200"
                        >
                          Log out
                        </button>
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {shownItems.map((item) => (
                <Disclosure.Button key={item.name} as="div">
                  <Link item={item} mobile={true} />
                </Disclosure.Button>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <ProfilePicture />
                </div>
                <div className="ml-3 text-base font-medium text-gray-800">
                  {data?.firstName} {data?.lastName}
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <button
                  type="button"
                  onClick={() => logout(logoutOptions)}
                  className="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Log out
                </button>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navigation;
