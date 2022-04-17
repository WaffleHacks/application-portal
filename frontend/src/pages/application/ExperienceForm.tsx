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
        {...getFieldProps('portfolio_url')}
      />

      <TextInput
        className="col-span-6 sm:col-span-3"
        label="Repositories (GitHub, GitLab, BitBucket, etc)"
        placeholder="https://github.com/WaffleHacks"
        {...getFieldProps('vcs_url')}
      />

      <NumberInput
        className="col-span-6 sm:col-span-3"
        label="How many hackathons have you attended?"
        max={50}
        min={0}
        required
        {...getFieldProps('hackathons_attended')}
      />

      <div className="col-span-6">
        <FileInput
          label="Resume"
          description="PDF up to 10MB"
          accept={['.pdf', 'application/pdf']}
          maxSize={10 * 1024 * 1024 /* 10MB in bytes */}
          {...getFieldProps('resume')}
        />
        <p className="mt-1 text-xs text-gray-500 text-right">
          <b>Note</b>: your resume is not auto-saved
        </p>
      </div>

      <SwitchInput
        className="col-span-6 sm:col-span-4"
        label="Share with sponsors"
        description="Allow us to share your name, portfolio, resume, and education information with our sponsors."
        required
        {...getFieldProps('share_information')}
      />
    </SidebarCard>
  );
};

export default ExperienceForm;
