import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import * as k8s from '@kubernetes/client-node';

export const registerTektonActions = (actions: any[]) => {
  actions.push(
    createTemplateAction<{
      namespace: string;
      pipelineName: string;
      parameters?: Record<string, string>;
      timeoutSeconds?: number;
    }>({
      id: 'tekton:run-pipeline-wait',
      description: 'Run a Tekton Pipeline and wait until completion',
      schema: {
        input: {
          type: 'object',
          required: ['namespace', 'pipelineName'],
          properties: {
            namespace: { type: 'string' },
            pipelineName: { type: 'string' },
            parameters: { type: 'object', additionalProperties: { type: 'string' } },
            timeoutSeconds: { type: 'number', default: 600 },
          },
        },
      },
      async handler(ctx) {
        const { namespace, pipelineName, parameters, timeoutSeconds = 600 } = ctx.input;
        const kc = new k8s.KubeConfig();
        kc.loadFromDefault();
        const k8sApi = kc.makeApiClient(k8s.CustomObjectsApi);

        const pipelineRunName = `${pipelineName}-run-${Date.now()}`;
        const pipelineRunManifest = {
          apiVersion: 'tekton.dev/v1beta1',
          kind: 'PipelineRun',
          metadata: { name: pipelineRunName, namespace },
          spec: {
            pipelineRef: { name: pipelineName },
            params: parameters
              ? Object.entries(parameters).map(([name, value]) => ({ name, value }))
              : [],
          },
        };

        await k8sApi.createNamespacedCustomObject(
          'tekton.dev',
          'v1beta1',
          namespace,
          'pipelineruns',
          pipelineRunManifest
        );

        ctx.logger.info(`PipelineRun ${pipelineRunName} triggered`);

        const endTime = Date.now() + timeoutSeconds * 1000;
        while (Date.now() < endTime) {
          const res: any = await k8sApi.getNamespacedCustomObject(
            'tekton.dev',
            'v1beta1',
            namespace,
            'pipelineruns',
            pipelineRunName
          );

          const status = res.body.status;
          const condition = status?.conditions?.find((c: any) => c.type === 'Succeeded');
          if (condition) {
            if (condition.status === 'True') {
              ctx.logger.info(`PipelineRun ${pipelineRunName} succeeded`);
              ctx.output('result', 'succeeded');
              return;
            } else if (condition.status === 'False') {
              throw new Error(`PipelineRun failed: ${condition.message}`);
            }
          }
          await new Promise(r => setTimeout(r, 5000));
        }

        throw new Error(`PipelineRun ${pipelineRunName} timed out after ${timeoutSeconds}s`);
      },
    })
  );
};