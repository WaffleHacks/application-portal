import { s3 } from '@pulumi/aws';
import { Policy } from '@pulumi/aws/iam';
import { ComponentResource, CustomResourceOptions, Input, Output, ResourceOptions, interpolate } from '@pulumi/pulumi';

interface Args {
  domain: Input<string>;
  bucket: Input<string>;
}

class Registration extends ComponentResource {
  public readonly policy: Output<string>;

  constructor(name: string, args: Args, opts?: CustomResourceOptions) {
    super('wafflehacks:application-portal:Registration', name, { options: opts }, opts);

    const defaultResourceOptions: ResourceOptions = { parent: this };
    const { bucket: bucketName, domain } = args;

    const bucket = new s3.BucketV2(
      `${name}-bucket`,
      {
        bucket: bucketName,
      },
      defaultResourceOptions,
    );

    new s3.BucketAclV2(
      `${name}-bucket-acl`,
      {
        bucket: bucket.id,
        acl: 'private',
      },
      defaultResourceOptions,
    );

    new s3.BucketCorsConfigurationV2(
      `${name}-bucket-cors`,
      {
        bucket: bucket.id,
        corsRules: [
          {
            allowedHeaders: ['*'],
            allowedMethods: ['GET', 'POST'],
            allowedOrigins: [interpolate`https://${domain}`, 'https://localhost.localdomain:3000'],
            exposeHeaders: ['x-amz-request-id'],
            maxAgeSeconds: 3600,
          },
        ],
      },
      defaultResourceOptions,
    );

    new s3.BucketPublicAccessBlock(
      `${name}-bucket-public`,
      {
        bucket: bucket.id,
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
      },
      defaultResourceOptions,
    );

    const policy = new Policy(
      `${name}-policy`,
      {
        policy: {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Action: ['s3:GetObject', 's3:PutObject'],
              Resource: [interpolate`arn:aws:s3:::${bucket.id}/*`],
            },
          ],
        },
      },
      defaultResourceOptions,
    );

    this.policy = policy.name;
    this.registerOutputs();
  }
}

export default Registration;
