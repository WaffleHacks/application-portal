import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, LinkButton } from '../../../../components/buttons';
import Confirm from '../../../../components/Confirm';
import Link from '../../../../components/Link';
import RenderMarkdown from '../../../../components/RenderMarkdown';
import { Participant, useDeleteSwagTierMutation, useGetSwagTierQuery } from '../../../../store';
import { Description, Item, Section } from '../../../components/description';
import Loading from '../../../components/Loading';
import NotFound from '../../../components/NotFound';
import { EmptyRow, InlineTable, Pagination, Table, usePagination } from '../../../components/table';

interface WithTierId {
  id: string;
}

const DeleteButton = ({ id }: WithTierId): JSX.Element => {
  const navigate = useNavigate();

  const [deleteMessage, { isLoading, isSuccess }] = useDeleteSwagTierMutation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && isSuccess) navigate('/swag/tiers');
  }, [isLoading, isSuccess]);

  return (
    <>
      <Confirm
        isOpen={open}
        close={() => setOpen(false)}
        onClick={() => deleteMessage(id)}
        title="Delete this tier?"
        description="Are you sure you want to delete this tier? All of the data will be permanently removed. This action cannot be undone."
      />

      <Button type="button" style="danger" onClick={() => setOpen(true)}>
        <TrashIcon className="h-4 w-4 mr-2" />
        Delete
      </Button>
    </>
  );
};

const ParticipantRow = (participant: Participant): JSX.Element => (
  <tr>
    <Table.Data index>
      {participant.first_name} {participant.last_name}
    </Table.Data>
    <Table.Data>{participant.email}</Table.Data>
    <Table.Data>
      <Link to={`/applications/${participant.id}`}>Details</Link>
    </Table.Data>
  </tr>
);

const Detail = (): JSX.Element => {
  const { id } = useParams();
  const { data, isLoading } = useGetSwagTierQuery(id as string);

  const { paginated, ...paginationProps } = usePagination(data?.participants || [], 10);

  if (isLoading) return <Loading />;
  if (data === undefined) return <NotFound message="We couldn't find that swag tier" returnTo="/swag/tiers" />;

  return (
    <>
      <Description
        title={data.name}
        subtitle="View all the details of the tier"
        titleLeft={
          <LinkButton to={`/swag/tiers/${id}/edit`} style="white">
            Edit <PencilIcon className="h-4 w-4 ml-2" aria-hidden="true" />
          </LinkButton>
        }
      >
        <Section>
          <Item name="Required workshops">{data.required_attendance}</Item>
          <Item name="Description" wide>
            <RenderMarkdown content={data.description} />
          </Item>
        </Section>
      </Description>

      <Description title="Participants" subtitle="All the participants currently with this tier">
        <InlineTable className="mx-4">
          <Table.Head className="bg-white">
            <Table.Label index>Name</Table.Label>
            <Table.Label>Email</Table.Label>
            <Table.InvisibleLabel>Detail</Table.InvisibleLabel>
          </Table.Head>
          <Table.Body>
            {paginated.length === 0 && <EmptyRow message="No participants with this tier yet." />}
            {paginated.map((p) => (
              <ParticipantRow key={p.id} {...p} />
            ))}
          </Table.Body>
        </InlineTable>
        <div className="m-4">
          <Pagination {...paginationProps} />
        </div>
      </Description>

      <div className="mt-3 flex justify-between">
        <LinkButton to="/swag/tiers">
          <ArrowLeftIcon className="h-4 w-5 mr-2" />
          Back
        </LinkButton>

        <DeleteButton id={id as string} />
      </div>
    </>
  );
};

export default Detail;
