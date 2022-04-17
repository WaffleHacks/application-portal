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
