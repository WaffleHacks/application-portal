import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Formik, Form as FormikForm } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import { Button } from '../../../components/buttons';
import { CheckboxGroupInput, CodeEditorInput, TextInput } from '../../../components/input';
import Link from '../../../components/Link';
import { Group } from '../../../store';
import { Description, Section } from '../../components/description';

interface Values {
  subject: string;
  recipients: Group[];
  content: string;
}

const initialValues: Values = {
  subject: '',
  recipients: [],
  content: '',
};

const validationRequired = 'This field is required';
const validationSchema = Yup.object({
  subject: Yup.string().required(validationRequired),
  content: Yup.string().required(validationRequired),
  recipients: Yup.array(Yup.string())
    .required(validationRequired)
    .min(1, 'At least 1 recipient must be specified')
    .test(
      'only-everyone',
      'Everyone cannot be combined with any other options',
      (value: (string | undefined)[] | undefined) => {
        if (value === undefined || value.some((i) => i === undefined)) return false;
        return !(value.indexOf(Group.Everyone) !== -1 && value.length !== 1);
      },
    )
    .test(
      'only-complete',
      'Application - Complete cannot be combined with any of the status options',
      (value: (string | undefined)[] | undefined) => {
        if (value === undefined || value.some((i) => i === undefined)) return false;
        if (value.indexOf(Group.ApplicationComplete) === -1) return true;

        return (
          value.indexOf(Group.StatusAccepted) === -1 &&
          value.indexOf(Group.StatusDenied) === -1 &&
          value.indexOf(Group.StatusPending) === -1
        );
      },
    ),
});

interface Props {
  onSubmit?: (values: Values) => void;
  isSubmitting?: boolean;
  values?: Values;
  title: string;
  subtitle?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const Form = ({ title, onSubmit = noop, isSubmitting, values = initialValues, subtitle }: Props): JSX.Element => {
  return (
    <Formik initialValues={values} onSubmit={onSubmit} validationSchema={validationSchema} validateOnChange={true}>
      {({ getFieldProps, isValid, isSubmitting: isFormikSubmitting }) => (
        <FormikForm>
          <Description title={title} subtitle={subtitle}>
            <Section>
              <TextInput label="Subject" required autoComplete="off" {...getFieldProps('subject')} />

              <CheckboxGroupInput
                className="sm:col-span-2"
                label="Recipients"
                items={[
                  {
                    value: 'Everyone',
                    description: 'Includes all participants unconditionally',
                  },
                  {
                    value: 'Application - Complete',
                    description: 'Includes all participants that have completed an application',
                  },
                  {
                    value: 'Application - Incomplete',
                    description: 'Includes all participants that have not yet completed an application',
                  },
                  {
                    value: 'Status - Accepted',
                    description: 'Includes all participants with applications that are accepted',
                  },
                  {
                    value: 'Status - Denied',
                    description: 'Includes all participants with applications that are denied',
                  },
                  {
                    value: 'Status - Pending',
                    description: 'Includes all participants with applications that are pending',
                  },
                ]}
                required
                {...getFieldProps('recipients')}
              />
            </Section>

            <Section>
              <CodeEditorInput
                className="sm:col-span-2 xl:col-span-3"
                label="Content"
                description={
                  <>
                    Messages can be customized for each participant using templating. The following details can be
                    included:
                    <ul className="list-disc ml-5">
                      <li>
                        First Name &rarr; <code>$&#123;first_name&#125;</code>
                      </li>
                      <li>
                        Last Name &rarr; <code>$&#123;last_name&#125;</code>
                      </li>
                    </ul>
                    <br />
                    While defaulting to plaintext, the message can be optionally rendered using{' '}
                    <Link to="https://mjml.io/" external={true}>
                      MJML
                    </Link>
                    . This can be written by hand or copy-and-pasted from the{' '}
                    <Link to="https://mjmlio.github.io/mjml-app/" external={true}>
                      MJML App
                    </Link>
                    . To use MJML, the message must start with <code>&lt;mjml&gt;</code> and end with{' '}
                    <code>&lt;/mjml&gt;</code>.
                  </>
                }
                required
                {...getFieldProps('content')}
              />
            </Section>
            <Section className="flex justify-end">
              <Button type="submit" style="success" disabled={!isValid || isSubmitting || isFormikSubmitting}>
                {isSubmitting || isFormikSubmitting ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  'Submit'
                )}
              </Button>
            </Section>
          </Description>
        </FormikForm>
      )}
    </Formik>
  );
};

export default Form;
