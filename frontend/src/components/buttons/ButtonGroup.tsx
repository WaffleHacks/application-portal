import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import React, { Fragment, ReactNode, forwardRef } from 'react';
import { Link } from 'react-router-dom';

import Button from './Button';

interface GroupedButtonProps {
  action: string | (() => void);
  children: ReactNode;
  disabled?: boolean;
  external?: boolean;
}

const GroupedButton = forwardRef<HTMLElement, GroupedButtonProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ action, children, disabled = false, external = false }, _): JSX.Element => {
    if (typeof action === 'function') {
      return (
        <button
          type="button"
          onClick={action}
          disabled={disabled}
          className="block px-4 py-2 text-sm w-full text-left text-gray-900 hover:bg-gray-100 hover:text-gray-900"
        >
          {children}
        </button>
      );
    } else if (external) {
      return (
        <a
          href={action}
          target="_blank"
          rel="noreferrer"
          className="block px-4 py-2 text-sm w-full text-left text-gray-900 hover:bg-gray-100 hover:text-gray-900"
        >
          {children}
        </a>
      );
    } else {
      return (
        <Link
          to={action}
          className="block px-4 py-2 text-sm w-full text-left text-gray-900 hover:bg-gray-100 hover:text-gray-900"
        >
          {children}
        </Link>
      );
    }
  },
);
GroupedButton.displayName = 'GroupedButton';

interface Props {
  children: ReactNode;
  disabled?: boolean;
  elements?: GroupedButtonProps[];
  onClick?: () => void;
}

const ButtonGroup = ({ children, disabled = false, elements = [], onClick }: Props): JSX.Element => (
  <div className="relative z-0 inline-flex rounded-md">
    <Button
      type="button"
      style="white"
      rounded="none"
      className="rounded-l-md border"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
    <Menu as="div" className="-ml-px relative block">
      <Menu.Button className="relative inline-flex items-center px-2 py-2 rounded-r-md shadow-sm border border-transparent bg-gray-50 text-sm font-medium text-gray-500 hover:bg-gray-200 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
        <span className="sr-only">Open options</span>
        <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="origin-top-right absolute right-0 mt-2 -mr-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {elements.map((e, i) => (
              <Menu.Item key={i}>
                <GroupedButton action={e.action} disabled={e.disabled} external={e.external}>
                  {e.children}
                </GroupedButton>
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  </div>
);

export default ButtonGroup;
