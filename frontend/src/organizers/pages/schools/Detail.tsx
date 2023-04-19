import { ArrowLeftIcon, ClipboardIcon, DocumentDuplicateIcon, PencilIcon } from '@heroicons/react/24/outline';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import Badge from '../../../components/Badge';
import { Button, LinkButton } from '../../../components/buttons';
import Confirm from '../../../components/Confirm';
import Link from '../../../components/Link';
import { useGetSchoolQuery, useUpdateSchoolMutation } from '../../../store';
import { Description, Item, Section } from '../../components/description';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import StatusBadge from '../../components/StatusBadge';
import { EmptyRow, InlineTable, Table } from '../../components/table';
import WarningFlag from '../../components/WarningFlag';

interface MarkAsReviewedProps {
  id: string;
}

const MarkAsReviewed = ({ id }: MarkAsReviewedProps): JSX.Element => {
  const [update] = useUpdateSchoolMutation();
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <Confirm
        isOpen={isOpen}
        close={() => setOpen(false)}
        onClick={() => update({ id, needs_review: false })}
        style="warning"
        title="Is this school valid?"
        description="Check to make sure this actually exists and that the name is correct. If anything is incorrect, make the necessary changes before approving the school."
        falsy="No"
        truthy="Yes"
      />

      <Button type="button" style="warning" onClick={() => setOpen(true)}>
        Review
        <ClipboardIcon className="h-4 w-4 ml-2" aria-hidden="true" />
      </Button>
    </>
  );
};

const Detail = (): JSX.Element => {
  const { id } = useParams();
  const { data, isLoading } = useGetSchoolQuery(id as string);

  if (isLoading) return <Loading />;
  if (data === undefined) return <NotFound message="We couldn't find that school" returnTo="/schools" />;

  return (
    <>
      <Description
        title={
          <span className="flex">
            {data.name}
            {data.needs_review && <WarningFlag reason="This school needs to be reviewed" />}
          </span>
        }
        titleLeft={
          <div className="space-x-4">
            {data.needs_review && <MarkAsReviewed id={data.id} />}
            <LinkButton to={`/schools/merge?id=${data.id}&name=${encodeURIComponent(data.name)}`} style="white">
              Merge
              <DocumentDuplicateIcon className="h-4 w-4 ml-2" aria-hidden="true" />
            </LinkButton>
            <LinkButton to={`/schools/${id}/edit`} style="white">
              Edit
              <PencilIcon className="h-4 w-4 ml-2" aria-hidden="true" />
            </LinkButton>
          </div>
        }
        subtitle={`${data.applications.length} applicant${data.applications.length !== 1 ? 's' : ''}`}
      >
        <Section>
          <Item name="Abbreviations">
            {data.abbreviations.length === 0 && 'N/A'}
            {data.abbreviations.map((a, i) => (
              <Badge key={i} className="mx-0.5">
                {a}
              </Badge>
            ))}
          </Item>
          <Item name="Alternatives">
            {data.alternatives.length === 0 && 'N/A'}
            {data.alternatives.map((a, i) => (
              <Badge key={i} className="mx-0.5">
                {a}
              </Badge>
            ))}
          </Item>
        </Section>

        <InlineTable className="mx-4">
          <Table.Head className="bg-white">
            <Table.Label index>Name</Table.Label>
            <Table.Label>Email</Table.Label>
            <Table.Label>Country</Table.Label>
            <Table.Label>Status</Table.Label>
            <Table.Label>Applied At</Table.Label>
            <Table.InvisibleLabel>View</Table.InvisibleLabel>
          </Table.Head>
          <Table.Body>
            {data.applications.length === 0 && <EmptyRow message={`No applications from ${data.name} yet.`} span={6} />}
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
                    <Link to={`/applications/${a.participant.id}`} className="text-indigo-600 hover:text-indigo-900">
                      Details
                    </Link>
                  </Table.Data>
                </tr>
              );
            })}
          </Table.Body>
        </InlineTable>
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
