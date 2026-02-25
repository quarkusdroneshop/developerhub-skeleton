import { tektonPipelineRunWithWaitAction } from './actions/tektonPipelineRunWithWaitAction';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';

export const registerTektonActions = (actions: any[]) => {
  actions.push(tektonPipelineRunWithWaitAction());
};