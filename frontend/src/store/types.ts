export interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export enum ApplicationStatus {
  Pending = 'pending',
  Rejected = 'rejected',
  Accepted = 'accepted',
}

export enum MessageStatus {
  Draft = 'Draft',
  Ready = 'Ready to Send',
  Sending = 'Sending...',
  Sent = 'Sent',
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

export enum AuthenticationStatus {
  Unauthenticated = 'unauthenticated',
  OAuth = 'oauth',
  IncompleteProfile = 'incomplete-profile',
  Authenticated = 'authenticated',
}

export enum Role {
  Participant = 'participant',
  Sponsor = 'sponsor',
  Organizer = 'organizer',
}

export interface Participant {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  is_admin: boolean;
}

export interface ParticipantWithSwag extends Participant {
  swag_tier?: SwagTier;
}

export interface School {
  id: string;
  name: string;
  abbreviations: string[];
  alternatives: string[];
  needs_review: boolean;
  applications: ReducedApplication[];
}

export interface SchoolList extends Omit<School, 'abbreviations' | 'alternatives' | 'applications'> {
  count: number;
}

export interface ReducedApplication {
  participant: Participant;

  status: ApplicationStatus;
  flagged: boolean;

  country: string;

  created_at: string;
}

export interface Application {
  participant: Participant;
  status: ApplicationStatus;

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
  status: MessageStatus;
  subject: string;

  created_at: string;
  updated_at: string;
}

export interface Message extends ReducedMessage {
  content: string;

  recipients: Recipient[];
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

export interface ReducedFeedback {
  participant: Participant;

  presentation: number;
  content: number;
  interest: number;
}

export interface Feedback extends ReducedFeedback {
  comments: string;
  again: boolean;

  event: ReducedEvent;
}

export interface ReducedEvent {
  id: number;
  name: string;

  code: string;
  enabled: boolean;
}

export interface Event extends ReducedEvent {
  link: string | null;

  valid_from: string;
  valid_until: string;

  feedback: ReducedFeedback[];
  attendees: Participant[];
}

export type ParticipantEvent = Pick<Event, 'code' | 'name' | 'link'>;

export interface ReducedSwagTier {
  id: number;
  name: string;
  required_attendance: number;
}

export interface SwagTier extends ReducedSwagTier {
  description: string;
  participants: Participant[];
}

export interface ServiceSettings {
  accepting_applications: boolean;
  checkin_start: string;
  checkin_end: string;
}

export interface ReducedProvider {
  slug: string;
  name: string;
  icon: string;
  enabled: boolean;
}

export interface Provider extends ReducedProvider {
  client_id: string;
  authorization_endpoint: string;
  token_endpoint: string;
  user_info_endpoint: string;
  scope: string;
}

export interface ProviderWithClientSecret extends Provider {
  client_secret: string;
}

export enum WebhookFormat {
  JSON = 'JSON',
  Discord = 'Discord',
}

export const WebhookTriggers: Record<number, string> = {
  1: 'Sign up',
  2: 'Application - Submitted',
  4: 'Application - Accepted',
  8: 'Application - Rejected',
  16: 'Event - Updated',
  32: 'Event - Deleted',
};

export interface ReducedWebhook {
  id: number;
  enabled: boolean;
  url: string;
}

export interface Webhook extends ReducedWebhook {
  format: WebhookFormat;
  triggered_by: number;
}

export interface WebhookWithSecret extends Webhook {
  secret?: string;
}

export interface StatisticEntry {
  label: string;
  count: number;
}

export interface SchoolStatisticEntry {
  id: string;
  name: string;
  count: number;
}

export enum ExportStatus {
  Processing = 'processing',
  Failed = 'failed',
  Completed = 'completed',
}

export interface Export {
  id: number;
  name: string;
  requester: string;
  status: ExportStatus;
  created_at: string;
  finished_at: string | null;
}
