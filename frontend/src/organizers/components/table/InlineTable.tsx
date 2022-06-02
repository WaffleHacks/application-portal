import classNames from 'classnames';
import React, { ReactNode } from 'react';

interface Props {
  className?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const InlineTable = ({ className, children, footer }: Props): JSX.Element => (
  <div className={classNames('flex flex-col', className)}>
    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
        <table className="min-w-full divide-y divide-gray-300">{children}</table>
        {footer}
      </div>
    </div>
  </div>
);

export default InlineTable;
