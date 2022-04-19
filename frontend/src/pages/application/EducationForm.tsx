import { useFormikContext } from 'formik';
import React from 'react';

import { AutoCompleteSelectInput, NumberInput, SelectInput } from '../../components/input';
import type { BaseItem } from '../../components/input';
import SidebarCard from '../../components/SidebarCard';

const APP_ID = process.env.REACT_APP_ALGOLIA_APP_ID || '';
const API_KEY = process.env.REACT_APP_ALGOLIA_API_KEY || '';

interface NamedItem extends BaseItem {
  name: string;
}

const display = (item: NamedItem) => item.name;

const EducationForm = (): JSX.Element => {
  const { getFieldProps } = useFormikContext();

  return (
    <SidebarCard
      title="Education"
      description="Tell us about your education. If you're not currently a student, put in the most recent school you attended."
    >
      <AutoCompleteSelectInput
        className="col-span-6 sm:col-span-4"
        label="School"
        indexName="schools"
        appId={APP_ID}
        apiKey={API_KEY}
        maxHits={25}
        required
        placeholder="Hacker University"
        display={display}
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

      <AutoCompleteSelectInput
        className="col-span-6 sm:col-span-3"
        label="Major"
        indexName="majors"
        appId={APP_ID}
        apiKey={API_KEY}
        display={display}
        placeholder="Computer Science"
        {...getFieldProps('major')}
      />
    </SidebarCard>
  );
};

export default EducationForm;
