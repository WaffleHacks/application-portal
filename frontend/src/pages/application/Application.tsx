import { useAuth0 } from '@auth0/auth0-react';
import { RefreshIcon } from '@heroicons/react/outline';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import Card from '../../components/Card';
import { MultiStepForm, Step } from '../../components/steps';
import {
  ApplicationAutosave,
  Gender,
  RaceEthnicity,
  useCreateApplicationMutation,
  useGetApplicationQuery,
  useGetAutosaveQuery,
  useSetAutosaveMutation,
} from '../../store';
import AboutForm from './AboutForm';
import EducationForm from './EducationForm';
import ExperienceForm from './ExperienceForm';
import { initialValues, validationSchema } from './form';
import Review from './Review';
import ShippingForm from './ShippingForm';

const formatAddress = (street: string, apartment: string, city: string, region: string, postal_code: string): string =>
  `${street}${apartment.length > 0 ? ', ' + apartment : ''}, ${city}, ${region} ${postal_code}`;

const Application = (): JSX.Element => {
  const navigate = useNavigate();

  const { user } = useAuth0();
  const { isLoading: alreadyAppliedLoading, isSuccess: alreadyApplied } = useGetApplicationQuery(user?.sub || '');

  // Auto-save hooks
  const { data, isLoading } = useGetAutosaveQuery();
  const [setAutosave, { isLoading: isSaving }] = useSetAutosaveMutation();

  // Creation hooks
  const [resume, setResume] = useState<File>();
  const [createApplication, { isLoading: isCreating, isUninitialized, isError, data: createData, reset }] =
    useCreateApplicationMutation();

  // Prevent the user from submitting another application
  useEffect(() => {
    if (alreadyAppliedLoading) return;
    else if (alreadyApplied) navigate('/');
  }, [alreadyApplied, alreadyAppliedLoading]);

  // Handle post-submit and resume file upload
  useEffect(() => {
    (async () => {
      if (!isUninitialized && !isCreating && !isError) {
        if (resume && createData?.upload) {
          const body = new FormData();
          // Add pre-computed fields
          for (const key in createData.upload.fields) body.append(key, createData.upload.fields[key]);

          // Add static fields
          body.append('acl', 'private');
          body.append('success_action_status', '201');
          body.append('Content-Type', resume.type);
          body.append('X-AMZ-Algorithm', 'AWS4-HMAC-SHA256');
          body.append('file', resume);

          try {
            await fetch(createData.upload.url, { method: 'POST', body });
          } catch (e) {
            toast.error('Failed to upload your resume. Please try again later');
            console.error(e);
            reset();
            return;
          }
        }

        // Ensure we properly navigate to the success page
        toast.success('Your application was submitted!');
        setTimeout(() => navigate('/'), 50);
      }
    })();
  }, [isCreating]);

  if (isLoading || alreadyAppliedLoading)
    return (
      <Card className="flex justify-around">
        <RefreshIcon className="h-8 w-8 animate-spin" />
      </Card>
    );

  return (
    <MultiStepForm
      initialValues={{ ...initialValues, ...data }}
      onSubmit={(values: ApplicationAutosave) => {
        createApplication({
          school: values.school,
          level_of_study: values.level_of_study,
          graduation_year: values.graduation_year,
          major: values.major.length > 0 ? values.major : undefined,
          hackathons_attended: values.hackathons_attended,
          portfolio_url: values.portfolio_url.length > 0 ? values.portfolio_url : undefined,
          vcs_url: values.vcs_url.length > 0 ? values.vcs_url : undefined,
          gender: values.gender as Gender,
          date_of_birth: values.date_of_birth,
          race_ethnicity: values.race_ethnicity as RaceEthnicity,
          country: values.country,
          shipping_address: formatAddress(
            values.street,
            values.apartment,
            values.city,
            values.region,
            values.postal_code,
          ),
          resume: values.resume !== undefined,
          share_information: values.share_information,
          legal_agreements_acknowledged: values.agree_to_privacy && values.agree_to_rules,
        });
        setResume(values.resume);
      }}
      isSaving={isSaving}
      isSubmitting={isCreating}
      onAutosave={setAutosave}
    >
      <Step title="About You" validationSchema={validationSchema.about}>
        <AboutForm />
      </Step>
      <Step title="Education" validationSchema={validationSchema.education}>
        <EducationForm />
      </Step>
      <Step title="Experience" validationSchema={validationSchema.experience}>
        <ExperienceForm />
      </Step>
      <Step title="Shipping" validationSchema={validationSchema.shipping}>
        <ShippingForm />
      </Step>
      <Step title="Review" validationSchema={validationSchema.review}>
        <Review />
      </Step>
    </MultiStepForm>
  );
};

export default Application;
