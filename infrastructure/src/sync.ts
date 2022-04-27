import { Policy } from '@pulumi/aws/iam';
import { Queue, QueuePolicy } from '@pulumi/aws/sqs';
import { ComponentResource, ComponentResourceOptions, Output, ResourceOptions } from '@pulumi/pulumi';

interface Args {
  topic: string;
}

class Sync extends ComponentResource {
  public readonly policy: Output<string>;

  constructor(name: string, args: Args, opts?: ComponentResourceOptions) {
    super('wafflehacks:application-portal:Sync', name, { options: opts }, opts);

    const defaultResourceOptions: ResourceOptions = { parent: this };
    const { topic } = args;

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
