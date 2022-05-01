import { ArrowLeftIcon, QuestionMarkCircleIcon, RefreshIcon } from '@heroicons/react/outline';
import { DateTime } from 'luxon';
import React, { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';

import Card from '../../../components/Card';
import { useGetApplicationQuery } from '../../../store';
import StatusBadge from '../../components/StatusBadge';

interface ItemProps {
  wide?: boolean;
  name: string;
  value: ReactNode;
}

const Item = ({ name, value, wide = false }: ItemProps): JSX.Element => (
  <div className={wide ? 'sm:grid-cols-1' : ''}>
    <dt className="text-sm font-medium text-gray-500">{name}</dt>
    <dd className="mt-1 text-sm text-gray-900">{value}</dd>
  </div>
);

interface ExternalLinkItemProps extends ItemProps {
  value: string | undefined;
}

const ExternalLinkItem = ({ name, value, wide }: ExternalLinkItemProps): JSX.Element => {
  const link = !value ? (
    'N/A'
  ) : (
    <a href={value} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 hover:underline">
      {value}
    </a>
  );
  return <Item name={name} value={link} wide={wide} />;
};

interface SectionProps {
  name: string;
  children: ReactNode;
}

const Section = ({ name, children }: SectionProps): JSX.Element => (
  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
    <h3 className="text-md leading-6 font-medium text-gray-700">{name}</h3>
    <dl className="mt-3 ml-5 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">{children}</dl>
  </div>
);

const BackButton = (): JSX.Element => (
  <Link
    to="/applications"
    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  >
    <ArrowLeftIcon className="h-4 w-5 mr-2" />
    Back
  </Link>
);

const Detail = (): JSX.Element => {
  const { id } = useParams();
  const { data, isLoading } = useGetApplicationQuery(id as string);

  if (isLoading) {
    return (
      <Card>
        <div className="mt-3 pt-12 pb-6 text-center">
          <RefreshIcon className="mx-auto h-12 w-12 animate-spin" />
        </div>
      </Card>
    );
  }

  if (data === undefined) {
    return (
      <Card>
        <div className="text-center">
          <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
          <h3 className="mt-2 text-md font-medium text-gray-900">We couldn&apos;t find that application</h3>
          <div className="mt-6">
            <BackButton />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="mt-5 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {data.participant.first_name} {data.participant.last_name}
            </h3>
            <StatusBadge status={data.status} large />
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Applied at: {DateTime.fromISO(data.created_at).toLocaleString(DateTime.DATETIME_SHORT)}
          </p>
        </div>
        <Section name="About">
          <Item name="Email" value={data.participant.email} />
          <Item name="Gender" value={data.gender} />
          <Item name="Race / Ethnicity" value={data.race_ethnicity} />
          <Item name="Date of Birth" value={data.date_of_birth} />
        </Section>
        <Section name="Education">
          <Item
            name="School"
            value={
              <Link to={`/schools/${data.school.id}`} className="text-blue-500 hover:text-blue-700 hover:underline">
                {data.school.name}
              </Link>
            }
          />
          <Item name="Expected Graduation Year" value={data.graduation_year || 'N/A'} />
          <Item name="Level of Study" value={data.level_of_study} />
          <Item name="Major" value={data.major || 'N/A'} />
        </Section>
        <Section name="Experience">
          <ExternalLinkItem name="Portfolio" value={data.portfolio_url} />
          <ExternalLinkItem name="Repositories" value={data.vcs_url} />
          <Item name="Hackathons attended" value={data.hackathons_attended} />
          <Item name="Share with sponsors?" value={data.share_information ? 'Yes' : 'No'} />
          {/* TODO: link to resume */}
          <Item name="Resume" value={data.resume || 'N/A'} />
        </Section>
        <Section name="Shipping">
          <Item name="Address" value={data.shipping_address || 'N/A'} />
          <Item name="Country" value={data.country} />
        </Section>
      </div>

      <div className="mt-3">
        <BackButton />
      </div>
    </>
  );
};

export default Detail;
