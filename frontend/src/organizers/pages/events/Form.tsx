import { ArrowLeftIcon, RefreshIcon } from '@heroicons/react/outline';
import { Formik, Form as FormikForm } from 'formik';
import { DateTime } from 'luxon';
import React from 'react';
import * as Yup from 'yup';

import { Button, LinkButton } from '../../../components/buttons';
import { DateTimeInput, SwitchInput, TextInput } from '../../../components/input';
import { Description, NamedSection, Section } from '../../components/description';

interface Values {
  name: string;
  valid_from: string;
  valid_until: string;
  enabled: boolean;
}

const initialValues: Values = {
  name: '',
  valid_from: '',
  valid_until: '',
  enabled: false,
};

interface Props {
  editEnabled?: boolean;
  returnTo: string;

  values?: Values;
  onSubmit: (values: Values) => void;
  isSubmitting: boolean;

  title: string;
  subtitle?: string;
}

const dateTimeValid = (value: string | undefined): boolean => DateTime.fromISO(value || '').isValid;
const validationSchema = Yup.object({
  name: Yup.string().required('This field is required'),
  valid_from: Yup.string().required('This field is required').test('valid', 'Must be a valid timestamp', dateTimeValid),
  valid_until: Yup.string()
    .required('This field is required')
    .test('valid', 'Must be a valid timestamp', dateTimeValid)
    .test('after-start', 'Code validity range must be positive', (value, { parent }) => {
      if (value && parent.valid_from) {
        const start = DateTime.fromISO(parent.valid_from);
        const end = DateTime.fromISO(value);
        return end > start;
      } else return true;
    }),
  enabled: Yup.boolean(),
});

const Form = ({
  editEnabled = false,
  returnTo,
  values = initialValues,
  onSubmit,
  isSubmitting,
  title,
  subtitle,
}: Props): JSX.Element => (
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
            {editEnabled && (
              <SwitchInput
                className="max-w-xs"
                label="Enabled?"
                description="Allow attendance to be taken for this event within the times specified below"
                required
                {...getFieldProps('enabled')}
              />
            )}
          </Section>

          <NamedSection name="Code Validity" description="The times when the attendance/feedback code should be valid">
            <DateTimeInput label="From" required {...getFieldProps('valid_from')} />
            <DateTimeInput label="Until" required {...getFieldProps('valid_until')} />
          </NamedSection>

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
