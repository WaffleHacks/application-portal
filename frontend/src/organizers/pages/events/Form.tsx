import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Formik, Form as FormikForm } from 'formik';
import { DateTime } from 'luxon';
import React from 'react';
import * as Yup from 'yup';

import { Button, LinkButton } from 'components/buttons';
import { DateTimeInput, LongTextInput, MarkdownInput, SwitchInput, TextInput } from 'components/input';
import { Description, Section } from 'organizers/components/description';

import Link from '../../../components/Link';

interface Values {
  name: string;
  link: string | null;
  description: string | null;
  valid_from: string;
  valid_until: string;
  enabled: boolean;
}

const initialValues: Values = {
  name: '',
  link: '',
  description: '',
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
  link: Yup.string().nullable().url('Must be a URL'),
  description: Yup.string().nullable(),
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
    onSubmit={(values) =>
      onSubmit({
        ...values,
        link: values.link === '' ? null : values.link,
        description: values.description === '' ? null : values.description,
      })
    }
    validationSchema={validationSchema}
    validateOnMount={true}
    validateOnChange={true}
  >
    {({ getFieldProps, isValid, isSubmitting: isFormikSubmitting }) => (
      <FormikForm>
        <Description title={title} subtitle={subtitle}>
          <Section>
            <TextInput label="Name" required autoComplete="off" {...getFieldProps('name')} />
            <TextInput label="URL" type="url" autoComplete="off" {...getFieldProps('link')} />
            {editEnabled && (
              <SwitchInput
                className="max-w-xs"
                label="Public?"
                description="Whether the event should be publicly visible"
                required
                {...getFieldProps('enabled')}
              />
            )}
          </Section>

          <Section>
            <MarkdownInput
              className="col-span-1 lg:col-span-2 xl:col-span-3"
              label="Description"
              required
              autoComplete="off"
              description="NOTE: Discord only supports basic text formatting such as bolding, italicizing, strikethroughs, and code blocks in scheduled event descriptions. This means you cannot use headings, named links, or quotes."
              {...getFieldProps('description')}
            />
          </Section>

          <Section>
            <DateTimeInput label="Starts at" required {...getFieldProps('valid_from')} />
            <DateTimeInput label="Ends at" required {...getFieldProps('valid_until')} />
          </Section>

          <Section>
            <div className="flex justify-between col-span-3">
              <LinkButton to={returnTo}>
                <ArrowLeftIcon className="h-4 w-5 mr-2" aria-hidden="true" />
                Back
              </LinkButton>
              <Button type="submit" style="success" disabled={!isValid || isSubmitting || isFormikSubmitting}>
                {isSubmitting || isFormikSubmitting ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
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
