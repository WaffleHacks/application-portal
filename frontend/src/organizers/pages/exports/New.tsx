import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Form, Formik } from 'formik';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

import { Button, LinkButton } from 'components/buttons';
import { SelectInput, TextInput } from 'components/input';
import { Description, Section } from 'organizers/components/description';
import { useInitiateExportMutation } from 'store';

enum Table {
  Applications = 'applications',
  Attendance = 'attendance',
}

const KINDS: Record<string, Record<string, string>> = {
  [Table.Applications]: {
    all: 'All',
    'mlh-registered': 'MLH Registrations',
    'resume-book': 'Resume Book',
  },
  [Table.Attendance]: {
    'check-ins': 'Check-ins',
    events: 'Events',
    'event-feedback': 'Event Feedback',
    'swag-tiers': 'Swag Tiers',
  },
};

interface Values {
  name: string;
  table: string;
  kind: string;
}

const initialValues: Values = {
  name: '',
  table: '',
  kind: '',
};

const validationSchema = Yup.object({
  name: Yup.string().required('This field is required'),
  table: Yup.string()
    .required('This field is required')
    .not(['Select an option...'], 'This field is required')
    .oneOf(Object.values(Table), `Must be one of ${Object.keys(Table).join(', ')}`),
  kind: Yup.string()
    .required('This field is required')
    .not(['Select an option...'], 'This field is required')
    .test('valid-option', (value, context) => {
      const options = KINDS[context.parent.table];
      if (options === undefined) return context.createError({ message: 'Select a group first' });
      if (!(value in options)) return context.createError({ message: `Must be one of ${Object.values(options)}` });
      return true;
    }),
});

const New = (): JSX.Element => {
  const navigate = useNavigate();
  const [create, { isLoading, isSuccess }] = useInitiateExportMutation();

  useEffect(() => {
    if (!isLoading && isSuccess) navigate('/exports');
  }, [isLoading, isSuccess]);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={create}
      validateOnMount={true}
      validateOnChange={true}
    >
      {({ getFieldProps, isValid, isSubmitting, values }) => (
        <Form>
          <Description title="New Export" subtitle="Create a new data export">
            <Section>
              <TextInput label="Name" autoComplete="off" {...getFieldProps('name')} />
              <SelectInput label="Group" {...getFieldProps('table')}>
                {Object.entries(Table).map(([display, value]) => (
                  <option key={value} value={value}>
                    {display}
                  </option>
                ))}
              </SelectInput>
              <SelectInput label="Template" {...getFieldProps('kind')}>
                {KINDS[values.table] &&
                  Object.entries(KINDS[values.table]).map(([value, display]) => (
                    <option key={value} value={value}>
                      {display}
                    </option>
                  ))}
              </SelectInput>
            </Section>

            <Section>
              <div className="flex justify-between col-span-3">
                <LinkButton to="/">
                  <ArrowLeftIcon className="h-4 w-5 mr-2" aria-hidden="true" />
                  Back
                </LinkButton>
                <Button type="submit" style="success" disabled={!isValid || isSubmitting || isLoading}>
                  {isSubmitting || isLoading ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    'Submit'
                  )}
                </Button>
              </div>
            </Section>
          </Description>
        </Form>
      )}
    </Formik>
  );
};

export default New;
