import { ComponentResource, ComponentResourceOptions, Input, Output, ResourceOptions } from '@pulumi/pulumi';

import Registration from './registration';
import Sync from './sync';

interface Args {
  /**
   * The name of the bucket to store resumes in
   */
  resumesBucket: Input<string>;
  /**
   * The SNS topic to subscribe to for receiveing participant profile updates
   */
  profilesTopic: Input<string>;
}

class ApplicationPortal extends ComponentResource {
  public readonly policies: Output<string>[];

  constructor(name: string, args: Args, opts?: ComponentResourceOptions) {
    super('wafflehacks:application-portal:ApplicationPortal', name, { options: opts }, opts);

    const defaultResourceOptions: ResourceOptions = { parent: this };
    const { resumesBucket, profilesTopic } = args;

    const registration = new Registration(`${name}-registration`, { bucket: resumesBucket }, defaultResourceOptions);
    const sync = new Sync(`${name}-sync`, { topic: profilesTopic }, defaultResourceOptions);

    this.policies = [registration.policy, sync.policy];
    this.registerOutputs();
  }
}

export default ApplicationPortal;
