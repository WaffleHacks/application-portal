import * as Yup from 'yup';

export interface FormFields {
  // About
  gender: string;
  raceEthnicity: string;
  dateOfBirth: string;

  // Education
  school: string;
  levelOfStudy: string;
  graduationYear: number;
  major: string;

  // Shipping
  street: string;
  apartment: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;

  // Experience
  portfolioUrl: string;
  vcsUrl: string;
  hackathonsAttended: number;
  resume?: File;
  shareInfo: boolean;

  // Legal
  agreedToPrivacy: boolean;
  agreedToRules: boolean;
}

export const initialValues: FormFields = {
  gender: '',
  raceEthnicity: '',
  dateOfBirth: '',
  school: '',
  levelOfStudy: '',
  graduationYear: new Date().getFullYear(),
  major: '',
  street: '',
  apartment: '',
  city: '',
  region: '',
  postalCode: '',
  country: '',
  portfolioUrl: '',
  vcsUrl: '',
  hackathonsAttended: 0,
  shareInfo: true,
  agreedToPrivacy: false,
  agreedToRules: false,
};

const required = 'This field is required';
export const validationSchema = {
  about: Yup.object({
    gender: Yup.string().oneOf(['Male', 'Female', 'Non-binary', 'Other'], required).required(required),
    raceEthnicity: Yup.string()
      .oneOf(
        [
          'American Indian / Alaskan Native',
          'Asian',
          'Native Hawaiian or other pacific islander',
          'Black / African American',
          'Hispanic',
          'White / Caucasian',
          'Multiple ethnicities / Other',
        ],
        required,
      )
      .required(required),
    dateOfBirth: Yup.string()
      .matches(/\d{1,2}-\d{1,2}-\d{4}/, 'Must be a valid date (DD-MM-YYYY)')
      .required(required),
  }),
  education: Yup.object({
    school: Yup.string().required(required),
    levelOfStudy: Yup.string().required(required),
    graduationYear: Yup.number()
      .min(1980, 'Must be greater than 1980')
      .max(2030, 'Must be less than 2030')
      .required(required),
    major: Yup.string().optional(),
  }),
  experience: Yup.object({
    portfolioUrl: Yup.string().url('Must be a valid URL').optional(),
    vcsUrl: Yup.string().url('Must be a valid URL').optional(),
    hackathonsAttended: Yup.number().min(0).max(50).required(required),
    resume: Yup.mixed().optional(),
    shareInfo: Yup.boolean(),
  }),
  shipping: Yup.object({
    street: Yup.string().required(required),
    apartment: Yup.string().optional(),
    city: Yup.string().required(required),
    region: Yup.string().required(required),
    postalCode: Yup.string().required(required),
    country: Yup.string().required(required),
  }),
  review: Yup.object({
    agreedToPrivacy: Yup.boolean(),
    agreedToRules: Yup.boolean(),
  }),
};
