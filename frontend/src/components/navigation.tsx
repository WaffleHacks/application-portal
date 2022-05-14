import { useAuth0 } from '@auth0/auth0-react';
import { RefreshIcon, UserIcon } from '@heroicons/react/outline';
import React, { ReactNode } from 'react';

import BaseLink from './Link';

interface NavItemIconProps {
  className?: string;
}

export interface NavItem {
  name: string;
  href: string;
  external?: boolean;
  hidden?: boolean;
  icon?: (props: NavItemIconProps) => JSX.Element;
}

export const ProfilePicture = (): JSX.Element => {
  const { isAuthenticated, user, isLoading } = useAuth0();

  if (isLoading) return <RefreshIcon className="h-8 w-8 rounded-full text-gray-500 animate-spin" />;
  else if (isAuthenticated && user?.picture)
    return <img className="h-8 w-8 rounded-full" src={user.picture} alt="profile picture" />;
  else return <UserIcon className="h-8 w-8 rounded-full text-gray-500" />;
};

interface LinkProps {
  item: NavItem;
  children?: (isActive: boolean) => ReactNode;
  classNames: (isActive: boolean) => string;
}

export const Link = ({ children, classNames, item }: LinkProps): JSX.Element => {
  return (
    <BaseLink to={item.href} external={item.external} className={({ isActive }) => classNames(isActive)}>
      {({ isActive }) => (
        <>
          {children && children(isActive)}
          {item.name}
        </>
      )}
    </BaseLink>
  );
};
