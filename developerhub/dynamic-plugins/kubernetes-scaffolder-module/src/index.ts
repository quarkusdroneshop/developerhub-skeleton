import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  scaffolderActionsExtensionPoint,
  createTemplateAction,
} from '@backstage/plugin-scaffolder-node';
import { z } from 'zod';
import yaml from 'js-yaml';
import * as k8s from '@kubernetes/client-node';

const createPipelineRunAction = () =>
  createTemplateAction({
    id: 'kubernetes:create-pipelinerun',
    description: 'Create Tekton PipelineRun',

    schema: {
      input: z =>
        z.object({
          namespace: z.string(),
          manifest: z.string(),
        }),
    },

    async handler(ctx) {
      const kc = new k8s.KubeConfig();
      kc.loadFromCluster();

      const k8sApi = k8s.KubernetesObjectApi.makeApiClient(kc);
      const resource = yaml.load(ctx.input.manifest) as k8s.KubernetesObject;

      await k8sApi.create(resource);

      ctx.logger.info(`PipelineRun created`);
    },
  });

export default createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'kubernetes-pipelinerun',

  register(reg) {
    reg.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
      },
      async init({ scaffolder }) {
        scaffolder.addActions(createPipelineRunAction());
      },
    });
  },
});