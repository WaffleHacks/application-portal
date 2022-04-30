import { DocumentIcon, RefreshIcon } from '@heroicons/react/outline';
import React from 'react';
import { Link } from 'react-router-dom';

import { useListApplicationsQuery } from '../../../store';

const List = (): JSX.Element => {
  const { data, isLoading } = useListApplicationsQuery();

  const loadingRow = (
    <tr>
      <td colSpan={5}>
        <div className="flex justify-around">
          <RefreshIcon className="h-8 w-8 animate-spin" />
        </div>
      </td>
    </tr>
  );

  const emptyRow = (
    <tr>
      <td colSpan={5}>
        <div className="text-center py-5">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No participants have submitted an application yet.</h3>
        </div>
      </td>
    </tr>
  );

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700">
            All the participants that have applied including their name, email, status, and application date.
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      Country
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      Applied At
                    </th>
                    <th scope="col" className="relative py-3 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {(isLoading || data === undefined) && loadingRow}
                  {!isLoading && data !== undefined && data.length === 0 && emptyRow}
                  {!isLoading &&
                    data !== undefined &&
                    data.map((a) => (
                      <tr key={a.participant.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {a.participant.first_name} {a.participant.last_name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{a.participant.email}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{a.country}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{a.status}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">TODO</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                            to={`/applications/${a.participant.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default List;
