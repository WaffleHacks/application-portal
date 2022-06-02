import { ArrowLeftIcon, RefreshIcon } from '@heroicons/react/outline';
import { Form, Formik } from 'formik';
import { DateTime } from 'luxon';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

import { Button, LinkButton } from '../../../components/buttons';
import { DateTimeInput, TextInput } from '../../../components/input';
import { useCreateEventMutation } from '../../../store';
import { Description, NamedSection, Section } from '../../components/description';

interface Values {
  name: string;
  valid_from: string;
  valid_until: string;
}

const initialValues: Values = {
  name: '',
  valid_from: '',
  valid_until: '',
};

const iso8601Regex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;
const validationSchema = Yup.object({
  name: Yup.string().required('This field is required'),
  valid_from: Yup.string()
    .required('This field is required')
    .matches(iso8601Regex, 'Must be a valid ISO8601 timestamp'),
  valid_until: Yup.string()
    .required('This field is required')
    .matches(iso8601Regex, 'Must be a valid ISO8601 timestamp')
    .test('after-start', 'Must come after the valid from date and time', (value, { parent }) => {
      if (value && parent.valid_from) {
        const start = DateTime.fromISO(parent.valid_from);
        const end = DateTime.fromISO(value);
        return end > start;
      } else return true;
    }),
});

const New = (): JSX.Element => {
  const navigate = useNavigate();
  const [create, { isLoading, isSuccess }] = useCreateEventMutation();

  useEffect(() => {
    if (!isLoading && isSuccess) navigate('/events');
  }, [isLoading, isSuccess]);

  return (
    <>
      <Formik
        initialValues={initialValues}
        onSubmit={(values: Values) => create(values)}
        validationSchema={validationSchema}
        validateOnMount={true}
        validateOnChange={true}
      >
        {({ getFieldProps, isValid, isSubmitting: isFormikSubmitting }) => (
          <Form>
            <Description title="New Event" subtitle="Create a new event to track">
              <Section>
                <TextInput label="Name" required autoComplete="off" {...getFieldProps('name')} />
              </Section>

              <NamedSection
                name="Code Validity"
                description="The times when the attendance/feedback code should be valid"
              >
                <DateTimeInput label="From" required {...getFieldProps('valid_from')} />
                <DateTimeInput label="Until" required {...getFieldProps('valid_until')} />
              </NamedSection>

              <Section>
                <div className="flex justify-between col-span-3">
                  <LinkButton to="/events">
                    <ArrowLeftIcon className="h-4 w-5 mr-2" aria-hidden="true" />
                    Back
                  </LinkButton>
                  <Button type="submit" style="success" disabled={!isValid || isLoading || isFormikSubmitting}>
                    {isLoading || isFormikSubmitting ? (
                      <RefreshIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
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
    </>
  );
};

export default New;
