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

export interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface School {
  id: string;
  name: string;
}

export interface ReducedApplication {
  participant: Participant;

  status: Status;
  draft_status: Status;

  country: string;

  created_at: string;
}

export interface Application {
  participant: Participant;
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

  phone_number: string;

  resume?: string;
  share_information: boolean;

  legal_agreements_acknowledged: boolean;
  created_at: string;

  // Only visible to organizers
  draft_status: Status;
  notes: string;
}

export interface ApplicationAutosave {
  // About
  phone_number: string;
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

  // MLH stuff
  mlh_code_of_conduct: boolean;
  mlh_event_logistics_information: boolean;
  mlh_communications: boolean;
}

export enum Group {
  Everyone = 'Everyone',
  ApplicationComplete = 'Application - Complete',
  ApplicationIncomplete = 'Application - Incomplete',
  StatusAccepted = 'Status - Accepted',
  StatusDenied = 'Status - Denied',
  StatusPending = 'Status - Pending',
}

export interface Recipient {
  group: Group;
}

export interface ReducedMessage {
  id: number;
  sent: boolean;
  subject: string;

  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;

  sent: boolean;

  subject: string;
  content: string;

  recipients: Recipient[];

  created_at: string;
  updated_at: string;
}

export enum TriggerType {
  SignUp = 'Sign Up',
  ApplicationSubmitted = 'Application - Submitted',
  ApplicationAccepted = 'Application - Accepted',
  ApplicationRejected = 'Application - Rejected',
  IncompleteApplication24H = 'Incomplete Application - 24hr',
  IncompleteApplication7D = 'Incomplete Application - 7 days',
}

export interface MessageTrigger {
  trigger: TriggerType;
  message: ReducedMessage | null;
}
