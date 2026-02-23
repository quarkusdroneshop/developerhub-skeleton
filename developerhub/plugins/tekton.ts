// packages/backend/src/plugins/tekton.ts
import { tektonActions } from '@janus-idp/backstage-plugin-tekton';
import { createRouter } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';

export default async function createTektonPlugin(env: {
  logger: any;
  database: any;
}): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    database: env.database,
    actions: [...tektonActions],
  });
}