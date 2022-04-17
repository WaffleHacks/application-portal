import React from 'react';

import FormCard from '../../components/FormCard';
import { FileInput, NumberInput, SwitchInput, TextInput } from '../../components/input';

export interface Networking {
  hackathonsAttended: number;
  portfolioUrl?: string;
  vcsUrl?: string;
  shareInfo: boolean;
  resume?: File;
}

interface Props {
  value: Networking;
  setValue: (value: Networking) => void;
}

const ExperienceForm = ({ value, setValue }: Props): JSX.Element => (
  <FormCard
    title="Experience"
    description="Even if this is your first hackathon, we'd love to see your portfolio or any past projects you've worked on. Your information will only be shared with our sponsors if you give consent."
  >
    <TextInput
      className="col-span-6 sm:col-span-3"
      label="Portfolio"
      value={value.portfolioUrl}
      onChange={(v) => setValue({ ...value, portfolioUrl: v })}
      placeholder="https://mywebsite.com"
    />

    <TextInput
      className="col-span-6 sm:col-span-3"
      label="Repositories (GitHub, GitLab, BitBucket, etc)"
      value={value.vcsUrl}
      onChange={(v) => setValue({ ...value, vcsUrl: v })}
      placeholder="https://github.com/WaffleHacks"
    />

    <NumberInput
      className="col-span-6 sm:col-span-3"
      label="How many hackathons have you attended?"
      max={50}
      min={0}
      value={value.hackathonsAttended}
      onChange={(v) => setValue({ ...value, hackathonsAttended: v })}
      required
    />

    <FileInput
      className="col-span-6"
      label="Resume"
      description="PDF up to 10MB"
      accept={['.pdf', 'application/pdf']}
      maxSize={10 * 1024 * 1024 /* 10MB in bytes */}
      value={value.resume}
      onChange={(f) => setValue({ ...value, resume: f })}
    />

    <SwitchInput
      className="col-span-6 sm:col-span-4"
      label="Share with sponsors"
      description="Allow us to share your name, portfolio, resume, and education information with our sponsors."
      value={value.shareInfo}
      onChange={(v) => setValue({ ...value, shareInfo: v })}
      required
    />
  </FormCard>
);

export default ExperienceForm;
