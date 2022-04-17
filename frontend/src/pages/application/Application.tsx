import React from 'react';

import { MultiStepForm, Step } from '../../components/steps';
import AboutForm from './AboutForm';
import EducationForm from './EducationForm';
import ExperienceForm from './ExperienceForm';
import { FormFields, initialValues, validationSchema } from './form';
import Review from './Review';
import ShippingForm from './ShippingForm';

const Application = (): JSX.Element => (
  <MultiStepForm initialValues={initialValues} onSubmit={(values: FormFields) => console.log(values)}>
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

export default Application;
