import { useFormikContext } from 'formik';
import React from 'react';

import { NumberInput, SelectInput, TextInput } from '../../components/input';
import SidebarCard from '../../components/SidebarCard';

const EducationForm = (): JSX.Element => {
  const { getFieldProps } = useFormikContext();

  return (
    <SidebarCard
      title="Education"
      description="Tell us about your education. If you're not currently a student, put in the most recent school you attended."
    >
      {/* TODO: autocomplete school while typing */}
      <TextInput
        className="col-span-6 sm:col-span-4"
        label="School"
        required
        placeholder="Hacker University"
        {...getFieldProps('school')}
      />

      <NumberInput
        className="col-span-6 sm:col-span-2"
        label="Expected graduation year"
        max={2030}
        min={1980}
        required
        {...getFieldProps('graduation_year')}
      />

      <SelectInput
        className="col-span-6 sm:col-span-3"
        label="Level of study"
        required
        {...getFieldProps('level_of_study')}
      >
        <option defaultChecked>Select an option...</option>
        <option>Elementary / Middle School / Primary School</option>
        <option>High School / Secondary School</option>
        <option>University - Undergraduate</option>
        <option>University - Master&apos;s / Doctoral</option>
        <option>Vocational / Code School</option>
        <option>Not currently a student</option>
      </SelectInput>

      {/* TODO: autocomplete major while typing */}
      <TextInput
        className="col-span-6 sm:col-span-3"
        label="Major"
        placeholder="Computer Science"
        {...getFieldProps('major')}
      />
    </SidebarCard>
  );
};

export default EducationForm;
