import { Form, Formik } from 'formik';
import React from 'react';

import { MultiStep, Step } from '../../components/steps';
import AboutForm from './AboutForm';
import EducationForm from './EducationForm';
import ExperienceForm from './ExperienceForm';
import { FormFields, initialValues } from './form';
import Review from './Review';
import ShippingForm from './ShippingForm';

const Application = (): JSX.Element => (
  <Formik initialValues={initialValues} onSubmit={(values: FormFields) => console.log(values)}>
    <Form>
      <MultiStep>
        <Step title="About You">
          <AboutForm />
        </Step>
        <Step title="Education">
          <EducationForm />
        </Step>
        <Step title="Experience">
          <ExperienceForm />
        </Step>
        <Step title="Shipping">
          <ShippingForm />
        </Step>
        <Step title="Review">
          <Review />
        </Step>
      </MultiStep>
    </Form>
  </Formik>
);

export default Application;
