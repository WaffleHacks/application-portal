import { ComponentResource, ComponentResourceOptions, Output, ResourceOptions } from '@pulumi/pulumi';

import Sync from './sync';

interface Args {
  syncTopic: string;
}

class ApplicationPortal extends ComponentResource {
  public readonly policies: Output<string>[];

  constructor(name: string, args: Args, opts?: ComponentResourceOptions) {
    super('wafflehacks:application-portal:ApplicationPortal', name, { options: opts }, opts);

    const defaultResourceOptions: ResourceOptions = { parent: this };
    const { syncTopic } = args;

    const sync = new Sync(`${name}-sync`, { topic: syncTopic }, defaultResourceOptions);

    this.policies = [sync.policy];
    this.registerOutputs();
  }
}

export default ApplicationPortal;
