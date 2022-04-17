import { useFormikContext } from 'formik';
import React from 'react';

import { FileInput, NumberInput, SwitchInput, TextInput } from '../../components/input';
import SidebarCard from '../../components/SidebarCard';

const ExperienceForm = (): JSX.Element => {
  const { getFieldProps } = useFormikContext();

  return (
    <SidebarCard
      title="Experience"
      description="Even if this is your first hackathon, we'd love to see your portfolio or any past projects you've worked on. Your information will only be shared with our sponsors if you give consent."
    >
      <TextInput
        className="col-span-6 sm:col-span-3"
        label="Portfolio"
        placeholder="https://mywebsite.com"
        {...getFieldProps('portfolioUrl')}
      />

      <TextInput
        className="col-span-6 sm:col-span-3"
        label="Repositories (GitHub, GitLab, BitBucket, etc)"
        placeholder="https://github.com/WaffleHacks"
        {...getFieldProps('vcsUrl')}
      />

      <NumberInput
        className="col-span-6 sm:col-span-3"
        label="How many hackathons have you attended?"
        max={50}
        min={0}
        required
        {...getFieldProps('hackathonsAttended')}
      />

      <FileInput
        className="col-span-6"
        label="Resume"
        description="PDF up to 10MB"
        accept={['.pdf', 'application/pdf']}
        maxSize={10 * 1024 * 1024 /* 10MB in bytes */}
        {...getFieldProps('resume')}
      />

      <SwitchInput
        className="col-span-6 sm:col-span-4"
        label="Share with sponsors"
        description="Allow us to share your name, portfolio, resume, and education information with our sponsors."
        required
        {...getFieldProps('shareInfo')}
      />
    </SidebarCard>
  );
};

export default ExperienceForm;
