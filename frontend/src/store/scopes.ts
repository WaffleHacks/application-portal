export enum PortalScope {
  // The three primary groups that a user can be in
  Participant = 'participant',
  Sponsor = 'sponsor',
  Organizer = 'organizer',

  // A flag extending the permissions of an organizer
  Director = 'director',
}

export enum ProfileScope {
  // Read the user's profile
  ProfileRead = 'profile:read',
}
