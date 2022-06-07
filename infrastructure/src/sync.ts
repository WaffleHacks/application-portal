import { getCallerIdentity } from '@pulumi/aws';
import { Policy } from '@pulumi/aws/iam';
import { TopicSubscription } from '@pulumi/aws/sns';
import { Queue, QueuePolicy } from '@pulumi/aws/sqs';
import {
  ComponentResource,
  ComponentResourceOptions,
  Input,
  Output,
  ResourceOptions,
  interpolate,
} from '@pulumi/pulumi';

export interface ProfilesConfig {
  /**
   * The API gateway ID for the profiles service
   */
  apiGateway: Input<string>;
  /**
   * The region where the profiles service is deployed
   */
  region: Input<string>;
  /**
   * The SNS topic to subscribe to for receiveing participant profile updates
   */
  topic: Input<string>;
}

class Sync extends ComponentResource {
  public readonly policy: Output<string>;

  constructor(name: string, args: ProfilesConfig, opts?: ComponentResourceOptions) {
    super('wafflehacks:application-portal:Sync', name, { options: opts }, opts);

    const defaultResourceOptions: ResourceOptions = { parent: this };
    const { apiGateway, region, topic } = args;

    const queue = new Queue(
      `${name}-queue`,
      {
        name,
        delaySeconds: 0,
        maxMessageSize: 4 * 1024,
        messageRetentionSeconds: 15 * 60,
        receiveWaitTimeSeconds: 20,
        visibilityTimeoutSeconds: 60,
      },
      defaultResourceOptions,
    );

    new QueuePolicy(
      `${name}-queue-policy`,
      {
        queueUrl: queue.url,
        policy: {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: {
                Service: 'sns.amazonaws.com',
              },
              Action: 'sqs:SendMessage',
              Resource: queue.arn,
              Condition: {
                ArnEquals: {
                  'aws:SourceArn': topic,
                },
              },
            },
          ],
        },
      },
      defaultResourceOptions,
    );

    new TopicSubscription(
      `${name}-subscription`,
      {
        endpoint: queue.arn,
        protocol: 'sqs',
        topic,
        rawMessageDelivery: true,
      },
      defaultResourceOptions,
    );

    const caller = getCallerIdentity();
    const accountId = caller.then((current) => current.accountId);

    const policy = new Policy(
      `${name}-policy`,
      {
        name,
        policy: {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Action: ['sqs:ChangeMessageVisibility', 'sqs:DeleteMessage', 'sqs:ReceiveMessage'],
              Resource: queue.arn,
            },
            {
              Effect: 'Allow',
              Action: ['execute-api:Invoke'],
              Resource: ['manage', 'manage/*'].map(
                (path) => interpolate`arn:aws:execute-api:${region}:${accountId}:${apiGateway}/prod/GET/${path}`,
              ),
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

export default Sync;
