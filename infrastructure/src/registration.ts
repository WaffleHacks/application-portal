import { s3 } from '@pulumi/aws';
import { Policy } from '@pulumi/aws/iam';
import { ComponentResource, CustomResourceOptions, Input, Output, ResourceOptions, interpolate } from '@pulumi/pulumi';

interface Args {
  bucket: Input<string>;
}

class Registration extends ComponentResource {
  public readonly policy: Output<string>;

  constructor(name: string, args: Args, opts?: CustomResourceOptions) {
    super('wafflehacks:application-portal:Registration', name, { options: opts }, opts);

    const defaultResourceOptions: ResourceOptions = { parent: this };
    const { bucket: bucketName } = args;

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
