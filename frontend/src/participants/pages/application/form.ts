import { isValidPhoneNumber } from 'react-phone-number-input';
import * as Yup from 'yup';

import { ApplicationAutosave, Gender, RaceEthnicity } from '../../../store';

type AutosaveResume = File | { path: string };

export const initialValues: ApplicationAutosave = {
  phone_number: '',
  gender: '',
  race_ethnicity: '',
  date_of_birth: '',
  school: '',
  level_of_study: '',
  graduation_year: new Date().getFullYear(),
  major: '',
  street: '',
  apartment: '',
  city: '',
  region: '',
  postal_code: '',
  country: '',
  portfolio_url: '',
  vcs_url: '',
  hackathons_attended: 0,
  share_information: true,
  agree_to_privacy: false,
  agree_to_rules: false,
  mlh_code_of_conduct: false,
  mlh_event_logistics_information: false,
  mlh_communications: false,
};

const required = 'This field is required';
export const validationSchema = {
  about: Yup.object({
    phone_number: Yup.string()
      .required(required)
      .test(
        'valid-number',
        'Must provide a valid phone number',
        (value: string | undefined) => value !== undefined && isValidPhoneNumber(value, 'US'),
      ),
    gender: Yup.string().oneOf(Object.values(Gender), required).required(required),
    race_ethnicity: Yup.string().oneOf(Object.values(RaceEthnicity), required).required(required),
    date_of_birth: Yup.string()
      .matches(/\d{1,2}-\d{1,2}-\d{4}/, 'Must be a valid date (DD-MM-YYYY)')
      .required(required),
  }),
  education: Yup.object({
    school: Yup.string().required(required),
    level_of_study: Yup.string().required(required),
    graduation_year: Yup.number()
      .min(1980, 'Must be greater than 1980')
      .max(2030, 'Must be less than 2030')
      .required(required),
    major: Yup.string().optional(),
  }),
  experience: Yup.object({
    portfolio_url: Yup.string().url('Must be a valid URL').optional(),
    vcs_url: Yup.string().url('Must be a valid URL').optional(),
    hackathons_attended: Yup.number().min(0).max(50).required(required),
    resume: Yup.mixed()
      .optional()
      .test(
        'file-provided',
        'Your resume was not auto-saved, please add it again.',
        (value) => value === undefined || value === null || value instanceof File,
      ),
    share_information: Yup.boolean(),
  }),
  shipping: Yup.object({
    street: Yup.string().required(required),
    apartment: Yup.string().optional(),
    city: Yup.string().required(required),
    region: Yup.string().required(required),
    postal_code: Yup.string().required(required),
    country: Yup.string().required(required),
  }),
  review: Yup.object({
    agree_to_privacy: Yup.boolean(),
    agree_to_rules: Yup.boolean(),
  }),
};
