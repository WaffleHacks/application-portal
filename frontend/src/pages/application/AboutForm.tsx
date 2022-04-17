import { useFormikContext } from 'formik';
import React from 'react';

import { DateInput, SelectInput } from '../../components/input';
import SidebarCard from '../../components/SidebarCard';
import { FormFields } from './form';

const AboutForm = (): JSX.Element => {
  const { getFieldProps } = useFormikContext<FormFields>();

  return (
    <SidebarCard
      title="About You"
      description="We just need to get some extra information about you so we can better tailor our hackathon to you."
    >
      <SelectInput className="col-span-6 sm:col-span-3" label="Gender" required {...getFieldProps('gender')}>
        <option>Male</option>
        <option>Female</option>
        <option>Non-binary</option>
        <option>Other</option>
      </SelectInput>

      <SelectInput
        className="col-span-6 sm:col-span-3"
        label="Race / Ethnicity"
        required
        {...getFieldProps('raceEthnicity')}
      >
        <option>American Indian / Alaskan Native</option>
        <option>Asian</option>
        <option>Native Hawaiian or other pacific islander</option>
        <option>Black / African American</option>
        <option>Hispanic</option>
        <option>White / Caucasian</option>
        <option>Multiple ethnicities / Other</option>
      </SelectInput>

      <DateInput
        className="col-span-6 sm:col-span-3"
        label="Date of birth"
        required
        {...getFieldProps('dateOfBirth')}
      />
    </SidebarCard>
  );
};

export default AboutForm;
