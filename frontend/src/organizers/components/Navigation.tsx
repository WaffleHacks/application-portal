import { useAuth0 } from '@auth0/auth0-react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import classNames from 'classnames';
import React, { Fragment } from 'react';

import { Link, NavItem, ProfilePicture } from '../../components/navigation';
import logo from '../../logo.png';
import { useGetProfileQuery, useSelector } from '../../store';

const AUTH0_CLIENT_ID = process.env.REACT_APP_AUTH0_CLIENT_ID;

export interface NavSection {
  id: string;
  name?: string;
  items: NavItem[];
}

const NavSection = (section: NavSection): JSX.Element => {
  const items = section.items.filter((item) => !item.hidden);

  return (
    <div key={section.id}>
      {section.name && <h3 className="ml-3 mb-2 text-gray-300 text-lg">{section.name}</h3>}
      {items.map((item) => (
        <Link
          key={item.name}
          item={item}
          classNames={(isActive: boolean) =>
            classNames(
              isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
              'group flex items-center px-2 py-2 text-base font-medium rounded-md',
            )
          }
        >
          {(isActive) =>
            item.icon && (
              <item.icon
                className={classNames(
                  isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300',
                  'mr-3 flex-shrink-0 h-6 w-6',
                )}
                aria-hidden="true"
              />
            )
          }
        </Link>
      ))}
    </div>
  );
};

interface NavSectionsListProps {
  sections: NavSection[];
}

const NavSectionsList = ({ sections }: NavSectionsListProps): JSX.Element => (
  <nav className="mt-5 flex-1 px-2 space-y-5">
    {sections.map((section) => (
      <NavSection key={section.id} {...section} />
    ))}
  </nav>
);

const Profile = (): JSX.Element => {
  const { logout } = useAuth0();
  const { data } = useGetProfileQuery();

  const logoutOptions = {
    client_id: AUTH0_CLIENT_ID,
    returnTo: window.location.origin,
  };

  return (
    <div className="flex-shrink-0 block">
      <div className="flex items-center">
        <div>
          <ProfilePicture />
        </div>
        <div className="ml-3">
          <p className="text-base md:text-sm font-medium text-white">
            {data === undefined ? 'Loading...' : data.firstName + ' ' + data.lastName}
          </p>
          <button
            type="button"
            onClick={() => logout(logoutOptions)}
            className="text-sm font-medium text-gray-400 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

interface Props {
  sections: NavSection[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Navigation = ({ sections, isOpen, setIsOpen }: Props): JSX.Element => {
  const profileTokenLoading = useSelector((state) => state.authentication.profile === undefined);

  return (
    <>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex z-40 md:hidden" onClose={setIsOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <img className="h-8 w-auto" src={logo} alt="WaffleHacks" />
                  <span className="text-white ml-3 font-bold text-lg">WaffleHacks</span>
                </div>
                <NavSectionsList sections={sections} />
              </div>
              <div className="flex-shrink-0 flex bg-gray-700 p-4">
                {profileTokenLoading ? <span className="text-gray-400">Loading...</span> : <Profile />}
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14" />
        </Dialog>
      </Transition.Root>

      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <img className="h-8 w-auto" src={logo} alt="WaffleHacks" />
              <span className="text-white ml-3 font-bold text-lg">WaffleHacks</span>
            </div>
            <NavSectionsList sections={sections} />
          </div>
          <div className="flex-shrink-0 flex bg-gray-700 p-4">
            {profileTokenLoading ? <span className="text-gray-400">Loading...</span> : <Profile />}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
