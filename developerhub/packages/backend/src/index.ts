/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */

import { createBackend } from '@backstage/backend-defaults';
import { tektonActions } from '@janus-idp/backstage-plugin-tekton';
import { createRouter as createScaffolderRouter } from '@backstage/plugin-scaffolder-backend';
import { tektonActions } from '@backstage/plugins/tekton';
import type { Router } from 'express';

export default async function createTektonPlugin(env: {
  logger: any;
  database: any;
}): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    database: env.database,
    actions: [...tektonActions],  // ← ここで tektonActions を展開して登録
  });
}

async function main() {
  const backend = createBackend();

  backend.add(import('@backstage/plugin-app-backend'));
  backend.add(import('@backstage/plugin-proxy-backend'));

  // scaffolder plugin
  backend.add(import('@backstage/plugin-scaffolder-backend'));
  backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
  backend.add(
    import('@backstage/plugin-scaffolder-backend-module-notifications'),
  );

  // techdocs plugin
  backend.add(import('@backstage/plugin-techdocs-backend'));

  // auth plugin
  backend.add(import('@backstage/plugin-auth-backend'));
  // See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
  backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
  // See https://backstage.io/docs/auth/guest/provider

  // catalog plugin
  backend.add(import('@backstage/plugin-catalog-backend'));
  backend.add(
    import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
  );

  // See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
  backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

  // permission plugin
  backend.add(import('@backstage/plugin-permission-backend'));
  // See https://backstage.io/docs/permissions/getting-started for how to create your own permission policy
  backend.add(
    import('@backstage/plugin-permission-backend-module-allow-all-policy'),
  );

  // search plugin
  backend.add(import('@backstage/plugin-search-backend'));

  // search engine
  // See https://backstage.io/docs/features/search/search-engines
  backend.add(import('@backstage/plugin-search-backend-module-pg'));

  // search collators
  backend.add(import('@backstage/plugin-search-backend-module-catalog'));
  backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

  // kubernetes plugin
  backend.add(import('@backstage/plugin-kubernetes-backend'));

  // notifications and signals plugins
  backend.add(import('@backstage/plugin-notifications-backend'));
  backend.add(import('@backstage/plugin-signals-backend'));

  // Tekton plugin を追加
  // Scaffolder backend を作るときに tektonActions を渡す
  async function main() {
    const backend = createBackend();
  
    // Scaffolder + Tekton actions
    backend.add(async env => {
      const scaffolderRouter = await createScaffolderRouter({
        logger: env.logger,
        database: env.database,
        actions: [...tektonActions], // ← Tekton actions を登録
      });
      env.router.use('/scaffolder', scaffolderRouter);
    });
  
    await backend.start();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});