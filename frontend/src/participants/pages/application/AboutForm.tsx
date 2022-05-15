import { useFormikContext } from 'formik';
import React from 'react';

import { DateInput, PhoneInput, SelectInput } from '../../../components/input';
import SidebarCard from '../../../components/SidebarCard';
import { ApplicationAutosave, Gender, RaceEthnicity } from '../../../store';

const AboutForm = (): JSX.Element => {
  const { getFieldProps } = useFormikContext<ApplicationAutosave>();

  return (
    <SidebarCard
      title="About You"
      description="We just need to get some extra information about you so we can better tailor our hackathon to you."
    >
      <PhoneInput className="col-span-6 sm:col-span-3" label="Phone number" {...getFieldProps('phone_number')} />

      <DateInput
        className="col-span-6 sm:col-span-3"
        label="Date of birth"
        required
        {...getFieldProps('date_of_birth')}
      />

      <SelectInput className="col-span-6 sm:col-span-3" label="Gender" required {...getFieldProps('gender')}>
        {Object.values(Gender).map((g, i) => (
          <option key={i}>{g}</option>
        ))}
      </SelectInput>

      <SelectInput
        className="col-span-6 sm:col-span-3"
        label="Race / Ethnicity"
        required
        {...getFieldProps('race_ethnicity')}
      >
        {Object.values(RaceEthnicity).map((e, i) => (
          <option key={i}>{e}</option>
        ))}
      </SelectInput>
    </SidebarCard>
  );
};

export default AboutForm;
