import { ArrowLeftIcon, RefreshIcon } from '@heroicons/react/outline';
import { ArrayHelpers, FieldArray, Form, Formik, FormikProps } from 'formik';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, LinkButton } from '../../../components/buttons';
import { TextInput } from '../../../components/input';
import { useCreateSchoolMutation } from '../../../store';
import { Description, NamedSection, Section } from '../../components/description';

interface Values {
  name: string;
  abbreviations: string[];
  alternatives: string[];
}

const initialValues: Values = {
  name: '',
  abbreviations: [],
  alternatives: [],
};

// A strictly typed version of formik.FieldArrayRenderProps
type RenderProps = ArrayHelpers & {
  form: FormikProps<Values>;
  name: string;
};

const InputList =
  (field: 'abbreviations' | 'alternatives') =>
  // eslint-disable-next-line react/display-name
  ({ form: { values }, push, remove }: RenderProps): JSX.Element =>
    (
      <>
        <div className="space-y-3">
          {values[field].map((a, i) => (
            <div key={i} className="grid grid-cols-2">
              <TextInput label={i + 1} name={`${field}.${i}`} required autoComplete="off" />
              <div className="max-h-10 mt-6 ml-5">
                <Button type="button" style="secondary" onClick={() => remove(i)}>
                  -
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button type="button" style="secondary" className="mt-3" onClick={() => push('')}>
          Add
        </Button>
      </>
    );

const New = (): JSX.Element => {
  const navigate = useNavigate();
  const [create, { isLoading, isSuccess }] = useCreateSchoolMutation();

  useEffect(() => {
    if (!isLoading && isSuccess) navigate('/schools');
  }, [isLoading, isSuccess]);

  return (
    <Formik initialValues={initialValues} onSubmit={(values) => create(values)}>
      {({ getFieldProps, isValid, isSubmitting }) => (
        <Form>
          <Description title="New School">
            <Section>
              <TextInput label="Name" required autoComplete="off" {...getFieldProps('name')} />
            </Section>
            <NamedSection name="Abbreviations" description="Common abbreviations or acronyms for the school">
              <div className="col-span-3">
                <FieldArray name="abbreviations" render={InputList('abbreviations')} />
              </div>
            </NamedSection>
            <NamedSection name="Alternatives" description="Any alternate names that the school may be known by">
              <div className="col-span-3">
                <FieldArray name="alternatives" render={InputList('alternatives')} />
              </div>
            </NamedSection>
            <Section>
              <div className="col-span-3 flex justify-between">
                <LinkButton to="/schools">
                  <ArrowLeftIcon className="h-4 w-5 mr-2" />
                  Back
                </LinkButton>
                <Button type="submit" style="success" disabled={!isValid || isSubmitting || isLoading}>
                  {isSubmitting ? <RefreshIcon className="h-4 w-4 animate-spin" aria-hidden="true" /> : 'Submit'}
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
