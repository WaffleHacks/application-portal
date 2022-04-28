import { Client, ResourceServer } from '@pulumi/auth0';
import { ComponentResource, CustomResourceOptions, Input, Output, ResourceOptions, interpolate } from '@pulumi/pulumi';

interface Args {
  // The domain where the application portal should be accessible
  domain: Input<string>;
}

class Authentication extends ComponentResource {
  public readonly clientId: Output<string>;

  public readonly api: Output<string>;

  constructor(name: string, args: Args, opts?: CustomResourceOptions) {
    super('wafflehacks:application-portal:Authentication', name, { options: opts }, opts);

    const defaultResourceOptions: ResourceOptions = { parent: this };
    const { domain } = args;

    const api = new ResourceServer(
      `${name}-api`,
      {
        allowOfflineAccess: true,
        name: 'Application Portal',
        identifier: 'https://apply.wafflehacks.org',
        signingAlg: 'RS256',
        skipConsentForVerifiableFirstPartyClients: true,

        // Define the possible permissions
        scopes: [
          {
            description: 'Denotes the participants group',
            value: 'participant',
          },
          {
            description: 'Denotes the sponsors group',
            value: 'sponsor',
          },
          {
            description: 'Denotes the organizers group',
            value: 'organizer',
          },
          {
            description: 'Denotes the directors flag for organizers',
            value: 'director',
          },
        ],

        // Enable RBAC
        enforcePolicies: true,
        tokenDialect: 'access_token_authz',
      },
      defaultResourceOptions,
    );
    this.api = api.identifier as Output<string>; // We know this will be defined

    const urls = ['https://localhost:3000', 'https://localhost.localdomain:3000', interpolate`https://${domain}`];
    const client = new Client(
      `${name}-client`,
      {
        name: 'Application Portal',
        appType: 'spa',
        isFirstParty: true,
        tokenEndpointAuthMethod: 'none',
        grantTypes: ['implicit', 'authorization_code', 'refresh_token'],
        jwtConfiguration: {
          alg: 'RS256',
          lifetimeInSeconds: 36000,
          secretEncoded: false,
        },
        oidcConformant: true,
        refreshToken: {
          expirationType: 'expiring',
          leeway: 0,
          tokenLifetime: 2592000,
          idleTokenLifetime: 1296000,
          infiniteTokenLifetime: false,
          infiniteIdleTokenLifetime: false,
          rotationType: 'rotating',
        },

        // Where the application be used
        callbacks: urls,
        allowedLogoutUrls: urls,
        webOrigins: urls,
      },
      defaultResourceOptions,
    );

    this.clientId = client.clientId;
    this.registerOutputs();
  }
}

export default Authentication;
