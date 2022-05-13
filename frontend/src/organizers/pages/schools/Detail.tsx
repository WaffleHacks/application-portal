import { ArrowLeftIcon } from '@heroicons/react/outline';
import { DateTime } from 'luxon';
import React from 'react';
import { useParams } from 'react-router-dom';

import { LinkButton } from '../../../components/buttons';
import Link from '../../../components/Link';
import { useGetSchoolQuery } from '../../../store';
import { Description } from '../../components/description';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import StatusBadge from '../../components/StatusBadge';

const Detail = (): JSX.Element => {
  const { id } = useParams();
  const { data, isLoading } = useGetSchoolQuery(id as string);

  if (isLoading) return <Loading />;
  if (data === undefined) return <NotFound message="We couldn't find that school" returnTo="/schools" />;

  return (
    <>
      <Description
        title={data.name}
        subtitle={`${data.applications.length} applicant${data.applications.length !== 1 ? 's' : ''}`}
      >
        <div className="ml-4 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold uppercase text-gray-500 sm:pl-6 md:pl-0"
                    >
                      Name
                    </th>
                    <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold uppercase text-gray-500">
                      Email
                    </th>
                    <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold uppercase text-gray-500">
                      Country
                    </th>
                    <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold uppercase text-gray-500">
                      Status
                    </th>
                    <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold uppercase text-gray-500">
                      Applied At
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 md:pr-0">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.applications.map((a) => {
                    const createdAt = DateTime.fromISO(a.created_at);
                    const formattedCreatedAt =
                      createdAt.diffNow().negate().as('days') > 1
                        ? createdAt.toLocaleString(DateTime.DATETIME_SHORT)
                        : createdAt.toRelative();

                    return (
                      <tr key={a.participant.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {a.participant.first_name} {a.participant.last_name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{a.participant.email}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{a.country}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <StatusBadge status={a.status} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formattedCreatedAt}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                            to={`/applications/${a.participant.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Description>

      <div className="mt-3">
        <LinkButton to="/schools">
          <ArrowLeftIcon className="h-4 w-5 mr-2" />
          Back
        </LinkButton>
      </div>
    </>
  );
};

export default Detail;
