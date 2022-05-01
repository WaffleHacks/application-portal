import React, { ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

const Head = ({ children }: Props): JSX.Element => (
  <thead className="bg-gray-50">
    <tr>{children}</tr>
  </thead>
);

const Body = ({ children }: Props): JSX.Element => (
  <tbody className="divide-y divide-gray-200 bg-white">{children}</tbody>
);

const Table = ({ children }: Props): JSX.Element => (
  <div className="mt-5 flex flex-col">
    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">{children}</table>
        </div>
      </div>
    </div>
  </div>
);

Table.Head = Head;
Table.Body = Body;

export default Table;
