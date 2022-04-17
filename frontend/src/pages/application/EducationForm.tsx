import React from 'react';

import FormCard from '../../components/FormCard';
import { NumberInput, SelectInput, TextInput } from '../../components/input';

export interface Education {
  school: string; // TODO: get school id
  levelOfStudy: string;
  graduationYear: number;
  major?: string;
}

interface Props {
  value: Education;
  setValue: (value: Education) => void;
}

const EducationForm = ({ value, setValue }: Props): JSX.Element => (
  <FormCard
    title="Education"
    description="Tell us about your education. If you're not currently a student, put in the most recent school you attended."
  >
    {/* TODO: autocomplete school while typing */}
    <TextInput
      className="col-span-6 sm:col-span-4"
      label="School"
      value={value.school}
      onChange={(v) => setValue({ ...value, school: v })}
      required
      placeholder="Hacker University"
    />

    <NumberInput
      className="col-span-6 sm:col-span-2"
      label="Expected graduation year"
      max={2030}
      min={1980}
      value={value.graduationYear}
      onChange={(v) => setValue({ ...value, graduationYear: v })}
      required
    />

    <SelectInput
      className="col-span-6 sm:col-span-3"
      label="Level of study"
      value={value.levelOfStudy}
      onChange={(v) => setValue({ ...value, levelOfStudy: v })}
      required
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
      value={value.major}
      onChange={(v) => setValue({ ...value, major: v })}
      placeholder="Computer Science"
    />
  </FormCard>
);

export default EducationForm;
