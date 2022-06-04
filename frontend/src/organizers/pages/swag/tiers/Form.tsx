import { ArrowLeftIcon, RefreshIcon } from '@heroicons/react/outline';
import { Formik, Form as FormikForm } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import { Button, LinkButton } from '../../../../components/buttons';
import { MarkdownInput, NumberInput, TextInput } from '../../../../components/input';
import Link from '../../../../components/Link';
import { SwagTier } from '../../../../store';
import { Description, Section } from '../../../components/description';

type Values = Omit<SwagTier, 'id' | 'participants'>;

const initialValues: Values = {
  name: '',
  description: '',
  required_attendance: Math.floor(Math.random() * 9) + 1,
};

interface Props {
  returnTo: string;

  values?: Values;
  onSubmit: (v: Values) => void;
  isSubmitting: boolean;

  title: string;
  subtitle?: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required('This field is required'),
  description: Yup.string().required('This field is required'),
  required_attendance: Yup.number()
    .min(0, 'Must be positive')
    .max(50, 'Must be less than 50')
    .required('This field is required'),
});

const Form = ({ returnTo, values = initialValues, onSubmit, isSubmitting, title, subtitle }: Props): JSX.Element => (
  <Formik
    initialValues={values}
    onSubmit={onSubmit}
    validationSchema={validationSchema}
    validateOnMount={true}
    validateOnChange={true}
  >
    {({ getFieldProps, isValid, isSubmitting: isFormikSubmitting }) => (
      <FormikForm>
        <Description title={title} subtitle={subtitle}>
          <Section>
            <TextInput label="Name" required autoComplete="off" {...getFieldProps('name')} />
            <NumberInput
              label="Required workshops"
              min={0}
              max={50}
              required
              {...getFieldProps('required_attendance')}
            />

            <MarkdownInput
              className="col-span-1 lg:col-span-2 xl:col-span-3"
              label="Description"
              required
              autoComplete="off"
              description={
                <>
                  <Link to="https://gist.github.com/akrantz01/4e3dbd82b7ddf661319e8f39ed80fa37" external>
                    This gist
                  </Link>{' '}
                  shows how the different markdown elements will look when displayed on the swag tiers page.
                </>
              }
              {...getFieldProps('description')}
            />
          </Section>

          <Section>
            <div className="flex justify-between col-span-3">
              <LinkButton to={returnTo}>
                <ArrowLeftIcon className="h-4 w-5 mr-2" aria-hidden="true" />
                Back
              </LinkButton>
              <Button type="submit" style="success" disabled={!isValid || isSubmitting || isFormikSubmitting}>
                {isSubmitting || isFormikSubmitting ? (
                  <RefreshIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
          </Section>
        </Description>
      </FormikForm>
    )}
  </Formik>
);

export default Form;
