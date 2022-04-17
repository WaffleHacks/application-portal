import { RefreshIcon } from '@heroicons/react/outline';
import React from 'react';

import { MultiStepForm, Step } from '../../components/steps';
import { ApplicationAutosave, useGetAutosaveQuery, useSetAutosaveMutation } from '../../store';
import AboutForm from './AboutForm';
import EducationForm from './EducationForm';
import ExperienceForm from './ExperienceForm';
import { initialValues, validationSchema } from './form';
import Review from './Review';
import ShippingForm from './ShippingForm';

const Application = (): JSX.Element => {
  const { data, isLoading } = useGetAutosaveQuery();
  const [setAutosave, { isLoading: isSaving }] = useSetAutosaveMutation();

  if (isLoading)
    return (
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mt-3 flex justify-around">
        <RefreshIcon className="h-8 w-8 animate-spin" />
      </div>
    );

  return (
    <MultiStepForm
      initialValues={{ ...initialValues, ...data }}
      onSubmit={(values: ApplicationAutosave) => console.log(values)}
      isSaving={isSaving}
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
