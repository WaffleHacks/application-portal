import { UserIcon } from '@heroicons/react/24/outline';
import Hex from 'crypto-js/enc-hex';
import md5 from 'crypto-js/md5';
import React, { ReactNode } from 'react';
import { useMatch } from 'react-router-dom';

import BaseLink from './Link';
import { useCurrentUserQuery } from '../store';

interface NavItemIconProps {
  className?: string;
}

export interface NavItem {
  name: string;
  href: string;
  external?: boolean;
  hidden?: boolean;
  exact?: boolean;
  icon?: (props: NavItemIconProps) => JSX.Element | null;
}

type ExtraValidator = <Item extends NavItem>(item: Item) => boolean;
const noopValidator: ExtraValidator = () => true;

const matches = (href: string, path?: string, exact?: boolean) => (exact ? path === href : path?.startsWith(href));

export const usePageTitle = <Item extends NavItem>(paths: Item[], extraValidator: ExtraValidator = noopValidator) => {
  const match = useMatch(window.location.pathname);

  const titles = paths
    .filter((item) => matches(item.href, match?.pathname, item.exact) && extraValidator(item))
    .reverse();

  return titles.length > 0 ? titles[0].name : 'Not found';
};

export const ProfilePicture = (): JSX.Element => {
  const { data } = useCurrentUserQuery();

  if (!data?.participant) return <UserIcon className="h-8 w-8 rounded-full text-gray-500" />;

  const url = buildAvatarURL(data.participant.email);
  return <img className="h-8 w-8 rounded-full" src={url} alt="profile picture"></img>;
};

const buildAvatarURL = (email: string): string => {
  const normalized = email.toLowerCase().trim();
  const hash = Hex.stringify(md5(normalized));
  return `https://www.gravatar.com/avatar/${hash}.png`;
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
