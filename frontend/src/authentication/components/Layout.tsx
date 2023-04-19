import React, { ReactNode } from 'react';

import logo from '../../logo.png';

interface Props {
  title: string;
  children: ReactNode;
}

const Layout = ({ title, children }: Props): JSX.Element => {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img className="mx-auto h-10 w-auto" src={logo} alt="WaffleHacks logo" />
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">{title}</h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
