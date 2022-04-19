export interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export enum Status {
  Pending = 'pending',
  Rejected = 'rejected',
  Accepted = 'accepted',
}

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  NonBinary = 'Non-binary',
  Other = 'Other',
}

export enum RaceEthnicity {
  AmericanIndian = 'American Indian / Alaskan Native',
  Asian = 'Asian',
  PacificIslander = 'Native Hawaiian or other pacific islander',
  Black = 'Black / African American',
  Hispanic = 'Hispanic / Latino',
  Caucasian = 'White / Caucasian',
  MultipleOther = 'Multiple ethnicities / Other',
}

export interface School {
  id: string;
  name: string;
}

export interface Application {
  participant_id: string;
  status: Status;

  school: School;
  level_of_study: string;
  graduation_year: number;
  major?: string;

  hackathons_attended: number;
  portfolio_url?: string;
  vcs_url?: string;

  gender: Gender;
  date_of_birth: string;
  race_ethnicity: RaceEthnicity;

  country: string;
  shipping_address: string;

  // TODO: figure out resume
  share_information: boolean;

  legal_agreements_acknowledged: boolean;
}

export interface ApplicationAutosave {
  // About
  gender: string;
  race_ethnicity: string;
  date_of_birth: string;

  // Education
  school: string;
  level_of_study: string;
  graduation_year: number;
  major: string;

  // Shipping
  street: string;
  apartment: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;

  // Experience
  portfolio_url: string;
  vcs_url: string;
  hackathons_attended: number;
  resume?: File;
  share_information: boolean;

  // Legal
  agree_to_privacy: boolean;
  agree_to_rules: boolean;
}
