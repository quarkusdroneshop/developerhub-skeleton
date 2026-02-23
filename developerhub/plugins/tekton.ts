// packages/backend/src/plugins/tekton.ts
import { createRouter as createScaffolderRouter } from '@backstage/plugin-scaffolder-backend';
import { tektonActions } from '@backstage-community/plugin-tekton-backend';
import type { Router } from 'express';

export default async function createTektonPlugin(env: { logger: any; database: any; }): Promise<Router> {
  return await createScaffolderRouter({
    logger: env.logger,
    database: env.database,
    actions: [...tektonActions],
  });
}