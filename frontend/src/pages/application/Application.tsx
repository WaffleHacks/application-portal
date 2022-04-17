import React, { ReactNode, useState } from 'react';

import FormCard from '../../components/FormCard';
import { CheckboxInput } from '../../components/input';
import { MultiStep, Step } from '../../components/steps';
import { useGetProfileQuery } from '../../store';
import AboutForm, { About } from './AboutForm';
import EducationForm, { Education } from './EducationForm';
import ExperienceForm, { Networking } from './ExperienceForm';
import ShippingForm, { ShippingAddress } from './ShippingForm';

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

interface LinkProps {
  href: string;
  children: ReactNode;
}

const Link = ({ href, children }: LinkProps) => (
  <a className="text-blue-500 hover:text-blue-600" href={href} target="_blank" rel="noreferrer">
    {children}
  </a>
);

const Application = (): JSX.Element => {
  const { data: user } = useGetProfileQuery();
  const [about, setAbout] = useState<About>({
    gender: '',
    raceEthnicity: '',
    dateOfBirth: '',
  });
  const [education, setEducation] = useState<Education>({
    school: '',
    levelOfStudy: '',
    graduationYear: new Date().getFullYear(),
  });
  const [shipping, setShipping] = useState<ShippingAddress>({
    street: '',
    city: '',
    region: '',
    postal: '',
    country: '',
  });
  const [experience, setExperience] = useState<Networking>({
    hackathonsAttended: 0,
    shareInfo: true,
  });
  const [agreedTosPrivacy, setAgreedTosPrivacy] = useState(false);
  const [agreedRules, setAgreedRules] = useState(false);

  return (
    <>
      <MultiStep initialStep={0} onSubmit={() => console.log('submitted')}>
        <Step title="About You">
          <AboutForm value={about} setValue={setAbout} />
        </Step>
        <Step title="Education">
          <EducationForm value={education} setValue={setEducation} />
        </Step>
        <Step title="Experience">
          <ExperienceForm value={experience} setValue={setExperience} />
        </Step>
        <Step title="Shipping">
          <ShippingForm value={shipping} setValue={setShipping} />
        </Step>
        <Step title="Review">
          <FormCard title="About You" grid={false}>
            <Row name="Name" value={user?.firstName + ' ' + user?.lastName} />
            <Row name="Email" value={user?.email} />
            <Row name="Gender" value={about.gender} />
            <Row name="Race / Ethnicity" value={about.raceEthnicity} />
            <Row name="Date of Birth" value={about.dateOfBirth} />
          </FormCard>
          <FormCard title="Education" className="mt-3" grid={false}>
            <Row name="School" value={education.school} />
            <Row name="Graduation year" value={education.graduationYear} />
            <Row name="Level of study" value={education.levelOfStudy} />
            <Row name="Major" value={education.major} />
          </FormCard>
          <FormCard title="Experience" className="mt-3" grid={false}>
            <Row
              name="Portfolio"
              value={experience.portfolioUrl && <Link href={experience.portfolioUrl}>{experience.portfolioUrl}</Link>}
            />
            <Row
              name="Repositories"
              value={experience.vcsUrl && <Link href={experience.vcsUrl}>{experience.vcsUrl}</Link>}
            />
            <Row name="Attended hackathons" value={experience.hackathonsAttended} />
            <Row name="Resume" value={experience.resume?.name} />
            <Row name="Share with sponsors" value={experience.shareInfo ? 'yes' : 'no'} />
          </FormCard>
          <FormCard title="Shipping" className="mt-3" grid={false}>
            <Row name="Street address" value={shipping.street} />
            <Row name="Apartment / Suite" value={shipping.apartment} />
            <Row name="City" value={shipping.city} />
            <Row name="State / Province" value={shipping.region} />
            <Row name="ZIP / Postal code" value={shipping.postal} />
            <Row name="Country" value={shipping.country} />
          </FormCard>
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mt-3 flex justify-around">
            <CheckboxInput
              label={
                <span>
                  I agree to the WaffleHacks <Link href="https://wafflehacks.org/privacy-policy">privacy policy</Link>{' '}
                  and <Link href="https://wafflehacks.org/data-sharing">data sharing policy</Link>.
                </span>
              }
              value={agreedTosPrivacy}
              onChange={setAgreedTosPrivacy}
              required
            />
            <CheckboxInput
              label={
                <span>
                  I agree to abide by the <Link href="https://wafflehacks.org/rules">rules</Link> and{' '}
                  <Link href="https://wafflehacks.org/code-of-conduct">code of conduct</Link>.
                </span>
              }
              value={agreedRules}
              onChange={setAgreedRules}
              required
            />
          </div>
        </Step>
      </MultiStep>
    </>
  );
};

export default Application;
