import { createTemplateAction } from '@backstage/plugin-scaffolder-backend';
import { KubernetesClient } from '@backstage/plugin-kubernetes-backend';
import yaml from 'js-yaml';

/**
 * Tekton PipelineRun を作成するアクション
 */
export const createPipelineRunAction = (client: KubernetesClient) =>
  createTemplateAction({
    id: 'kubernetes:create-pipelinerun', // このIDをテンプレートで指定
    description: 'Create a Tekton PipelineRun in Kubernetes',
    schema: {
      input: {
        type: 'object',
        required: ['namespace', 'manifest'],
        properties: {
          namespace: { type: 'string', description: 'Namespace to create the PipelineRun in' },
          manifest: { type: 'string', description: 'YAML manifest of the PipelineRun' },
        },
      },
    },
    async handler(ctx) {
      const { namespace, manifest } = ctx.input;

      // YAML をオブジェクトに変換
      const resource = yaml.load(manifest) as any;

      // Kubernetes に作成
      await client.createResource(namespace, resource);

      ctx.logger.info(`PipelineRun created in namespace ${namespace}`);
    },
  });