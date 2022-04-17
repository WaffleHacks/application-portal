import React, { useEffect, useState } from 'react';

import FormCard from '../../components/FormCard';
import { DateInput, SelectInput } from '../../components/input';

export interface About {
  gender: string;
  raceEthnicity: string;
  dateOfBirth: string;
}

interface Props {
  value: About;
  setValue: (value: About) => void;
}

const debug = <T,>(v: T): T => {
  console.log(v);
  return v;
};

const AboutForm = ({ value, setValue }: Props): JSX.Element => {
  const [dob, setDob] = useState(value.dateOfBirth);

  // This is an ENORMOUS hack to prevent flatpickr from overwriting the other values
  useEffect(() => setDob(value.dateOfBirth), [value.dateOfBirth]);
  useEffect(() => setValue({ ...value, dateOfBirth: dob }), [dob]);

  return (
    <FormCard
      title="About You"
      description="We just need to get some extra information about you so we can better tailor our hackathon to you."
    >
      <SelectInput
        className="col-span-6 sm:col-span-3"
        label="Gender"
        value={value.gender}
        onChange={(v) => setValue(debug({ ...value, gender: v }))}
        required
      >
        <option>Male</option>
        <option>Female</option>
        <option>Non-binary</option>
        <option>Other</option>
      </SelectInput>

      <SelectInput
        className="col-span-6 sm:col-span-3"
        label="Race / Ethnicity"
        value={value.raceEthnicity}
        onChange={(v) => setValue(debug({ ...value, raceEthnicity: v }))}
        required
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
        value={value.dateOfBirth}
        onChange={setDob}
        required
      />
    </FormCard>
  );
};

export default AboutForm;
