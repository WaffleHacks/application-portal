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
import { EmptyRow, Table } from '../../components/table';

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
                <Table.Head className="bg-white">
                  <Table.Label index>Name</Table.Label>
                  <Table.Label>Email</Table.Label>
                  <Table.Label>Country</Table.Label>
                  <Table.Label>Status</Table.Label>
                  <Table.Label>Applied At</Table.Label>
                  <Table.InvisibleLabel>View</Table.InvisibleLabel>
                </Table.Head>
                <Table.Body>
                  {data.applications.length === 0 && (
                    <EmptyRow message={`No applications from ${data.name} yet.`} span={6} />
                  )}
                  {data.applications.map((a) => {
                    const createdAt = DateTime.fromISO(a.created_at);
                    const formattedCreatedAt =
                      createdAt.diffNow().negate().as('days') > 1
                        ? createdAt.toLocaleString(DateTime.DATETIME_SHORT)
                        : createdAt.toRelative();

                    return (
                      <tr key={a.participant.id}>
                        <Table.Data index>
                          {a.participant.first_name} {a.participant.last_name}
                        </Table.Data>
                        <Table.Data>{a.participant.email}</Table.Data>
                        <Table.Data>{a.country}</Table.Data>
                        <Table.Data>
                          <StatusBadge status={a.status} />
                        </Table.Data>
                        <Table.Data>{formattedCreatedAt}</Table.Data>
                        <Table.Data className="relative pr-4 text-right sm:pr-6">
                          <Link
                            to={`/applications/${a.participant.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Details
                          </Link>
                        </Table.Data>
                      </tr>
                    );
                  })}
                </Table.Body>
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
