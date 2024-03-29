import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import React, { Fragment } from 'react';

import { NavItem as BaseNavItem, Link, ProfilePicture } from 'components/navigation';
import logo from 'logo.png';

import { DesktopProfile, MobileProfile } from './Profiles';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const linkClassNames =
  (mobile: boolean) =>
  (isActive: boolean): string => {
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

export interface NavItem extends BaseNavItem {
  acceptedOnly?: boolean;
}

interface Props {
  items: NavItem[];
  accepted: boolean;
}

const Navigation = ({ items, accepted }: Props): JSX.Element => {
  const shownItems = items.filter((i) => !i.hidden && (!i.acceptedOnly || accepted));

  return (
    <Disclosure as="nav" className="bg-white shadow-sm">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <img className="h-8 w-auto" src={logo} alt="WaffleHacks" />
                  <span className="ml-3 font-bold text-lg">WaffleHacks</span>
                </div>
                <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                  {shownItems.map((item) => (
                    <Link key={item.name} item={item} classNames={linkClassNames(false)} />
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
                          <DesktopProfile />
                        </span>
                      </Menu.Item>
                      <Menu.Item>
                        <a
                          href={`${BASE_URL}/auth/logout`}
                          className="block px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-200"
                        >
                          Log out
                        </a>
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {shownItems.map((item) => (
                <Disclosure.Button key={item.name} as="div">
                  <Link item={item} classNames={linkClassNames(true)} />
                </Disclosure.Button>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <MobileProfile />
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navigation;
