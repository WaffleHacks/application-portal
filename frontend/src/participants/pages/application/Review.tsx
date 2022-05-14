import { useFormikContext } from 'formik';
import React, { ReactNode } from 'react';

import Card from '../../../components/Card';
import { CheckboxInput } from '../../../components/input';
import Link from '../../../components/Link';
import SidebarCard from '../../../components/SidebarCard';
import { ApplicationAutosave, useGetProfileQuery } from '../../../store';

interface RowProps {
  name: string;
  value?: ReactNode;
}

const Row = ({ name, value }: RowProps) => (
  <div className="grid grid-cols-3 max-w-2xl">
    <p className="font-bold">{name}:</p>
    <p className="col-span-2">{value}</p>
  </div>
);

const Review = (): JSX.Element => {
  const { getFieldProps, values } = useFormikContext<ApplicationAutosave>();
  const { data: user } = useGetProfileQuery();

  return (
    <>
      <SidebarCard title="About You" grid={false}>
        <Row name="Name" value={user?.firstName + ' ' + user?.lastName} />
        <Row name="Email" value={user?.email} />
        <Row name="Gender" value={values.gender} />
        <Row name="Race / Ethnicity" value={values.race_ethnicity} />
        <Row name="Date of Birth" value={values.date_of_birth} />
      </SidebarCard>
      <SidebarCard title="Education" className="mt-3" grid={false}>
        <Row name="School" value={values.school} />
        <Row name="Graduation year" value={values.graduation_year} />
        <Row name="Level of study" value={values.level_of_study} />
        <Row name="Major" value={values.major} />
      </SidebarCard>
      <SidebarCard title="Shipping" className="mt-3" grid={false}>
        <Row
          name="Portfolio"
          value={
            values.portfolio_url && (
              <Link to={values.portfolio_url} external={true}>
                {values.portfolio_url}
              </Link>
            )
          }
        />
        <Row
          name="Repositories"
          value={
            values.vcs_url && (
              <Link to={values.vcs_url} external={true}>
                {values.vcs_url}
              </Link>
            )
          }
        />
        <Row name="Attended hackathons" value={values.hackathons_attended} />
        <Row name="Resume" value={values.resume?.name} />
        <Row name="Share with sponsors" value={values.share_information ? 'yes' : 'no'} />
      </SidebarCard>
      <SidebarCard title="Experience" className="mt-3" grid={false}>
        <Row name="Street address" value={values.street} />
        <Row name="Apartment / Suite" value={values.apartment} />
        <Row name="City" value={values.city} />
        <Row name="State / Province" value={values.region} />
        <Row name="ZIP / Postal code" value={values.postal_code} />
        <Row name="Country" value={values.country} />
      </SidebarCard>
      <Card className="flex justify-around">
        <CheckboxInput
          label={
            <span>
              I agree to the WaffleHacks{' '}
              <Link to="https://wafflehacks.org/privacy-policy" external={true}>
                privacy policy
              </Link>{' '}
              and{' '}
              <Link to="https://wafflehacks.org/data-sharing" external={true}>
                data sharing policy
              </Link>
              .
            </span>
          }
          required
          {...getFieldProps('agree_to_privacy')}
        />
        <CheckboxInput
          label={
            <span>
              I agree to abide by the{' '}
              <Link to="https://wafflehacks.org/rules" external={true}>
                rules
              </Link>{' '}
              and{' '}
              <Link to="https://wafflehacks.org/code-of-conduct" external={true}>
                code of conduct
              </Link>
              .
            </span>
          }
          required
          {...getFieldProps('agree_to_rules')}
        />
      </Card>
    </>
  );
};

export default Review;
