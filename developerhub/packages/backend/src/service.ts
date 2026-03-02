import { createPipelineRunAction } from './scaffolder/actions';
import { KubernetesClient } from '@backstage/plugin-kubernetes-backend';

// KubernetesClient の作成は既存プラグインから流用
const client = new KubernetesClient({ /* kubeconfig や cluster 配置 */ });

scaffolder.addTemplateAction(createPipelineRunAction(client));