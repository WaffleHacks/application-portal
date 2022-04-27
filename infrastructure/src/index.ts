import { ComponentResource, ComponentResourceOptions, Output, ResourceOptions } from '@pulumi/pulumi';

import Registration from './registration';
import Sync from './sync';

interface Args {
  resumesBucket: string;
  syncTopic: string;
}

class ApplicationPortal extends ComponentResource {
  public readonly policies: Output<string>[];

  constructor(name: string, args: Args, opts?: ComponentResourceOptions) {
    super('wafflehacks:application-portal:ApplicationPortal', name, { options: opts }, opts);

    const defaultResourceOptions: ResourceOptions = { parent: this };
    const { resumesBucket, syncTopic } = args;

    const registration = new Registration(`${name}-registration`, { bucket: resumesBucket }, defaultResourceOptions);
    const sync = new Sync(`${name}-sync`, { topic: syncTopic }, defaultResourceOptions);

    this.policies = [registration.policy, sync.policy];
    this.registerOutputs();
  }
}

export default ApplicationPortal;
