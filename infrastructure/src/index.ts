import { ComponentResource, ComponentResourceOptions, ResourceOptions } from '@pulumi/pulumi';

class ApplicationPortal extends ComponentResource {
  constructor(name: string, opts?: ComponentResourceOptions) {
    super('wafflehacks:application-portal:ApplicationPortal', name, { options: opts }, opts);

    const defaultResourceOptions: ResourceOptions = { parent: this };

    this.registerOutputs();
  }
}

export default ApplicationPortal;
