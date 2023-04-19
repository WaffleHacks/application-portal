import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Badge from '../../../../components/Badge';
import { Button, LinkButton } from '../../../../components/buttons';
import Confirm from '../../../../components/Confirm';
import { useDeleteProviderMutation, useGetProviderQuery } from '../../../../store';
import { Description, Item, NamedSection, Section } from '../../../components/description';
import Loading from '../../../components/Loading';
import NotFound from '../../../components/NotFound';

const Detail = (): JSX.Element => {
  const { slug } = useParams();
  const { data, isLoading } = useGetProviderQuery(slug as string);

  if (isLoading) return <Loading />;
  if (data === undefined) return <NotFound message="We couldn't find that provider" returnTo="/providers" />;

  return (
    <>
      <Description
        title={data.name}
        titleLeft={<LinkButton to={`/providers/${slug}/edit`}>Edit</LinkButton>}
        subtitle="View all the details of the provider"
      >
        <Section>
          <Item name="Slug">{slug}</Item>
          <Item name="Icon">
            <img className="h-5" aria-hidden="true" alt={`${data.name} logo`} src={data.icon} />
          </Item>
          <Item name="Enabed?">
            <Badge color={data.enabled ? 'green' : 'red'}>{data.enabled ? 'Yes' : 'No'}</Badge>
          </Item>
        </Section>

        <NamedSection name="Configuration">
          <Item name="Client ID">{data.client_id}</Item>
          <Item name="Client Secret">*********</Item>
          <Item name="Scopes">{data.scope}</Item>
        </NamedSection>

        <NamedSection name="URLs">
          <Item name="Authorization Endpoint">{data.authorization_endpoint}</Item>
          <Item name="Token Endpoint">{data.token_endpoint}</Item>
          <Item name="User Info Endpoint">{data.user_info_endpoint}</Item>
        </NamedSection>
      </Description>

      <div className="mt-3 flex justify-between">
        <LinkButton to="/providers">
          <ArrowLeftIcon className="h-4 w-5 mr-2" />
          Back
        </LinkButton>
        <DeleteButton slug={slug as string} />
      </div>
    </>
  );
};

interface WithSlug {
  slug: string;
}

const DeleteButton = ({ slug }: WithSlug): JSX.Element => {
  const navigate = useNavigate();

  const [deleteProvider, { isLoading, isSuccess }] = useDeleteProviderMutation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && isSuccess) navigate('/providers');
  }, [isLoading, isSuccess]);

  return (
    <>
      <Confirm
        isOpen={open}
        close={() => setOpen(false)}
        onClick={() => deleteProvider(slug)}
        title="Delete this provider?"
        description="Are you sure you want to delete this provider? No participants will be able to login with it and any in-flight requests will fail. This action cannot be undone."
      />

      <Button type="button" style="danger" onClick={() => setOpen(true)}>
        <TrashIcon className="h-4 w-4 mr-2" />
        Delete
      </Button>
    </>
  );
};

export default Detail;
