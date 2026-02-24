import { createBackend } from '@backstage/backend-defaults';
import { tektonBackendModule } from '@backstage/community-plugin-tekton-backend';

async function main() {
  const backend = createBackend();

  backend.add(import('@backstage/plugin-app-backend'));
  backend.add(import('@backstage/plugin-proxy-backend'));

  backend.add(import('@backstage/plugin-scaffolder-backend'));
  backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));

  backend.add(import('@backstage/plugin-techdocs-backend'));
  backend.add(import('@backstage/plugin-auth-backend'));
  backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
  backend.add(import('@backstage/plugin-catalog-backend'));
  backend.add(import('@backstage/plugin-permission-backend'));
  backend.add(import('@backstage/plugin-search-backend'));
  backend.add(import('@backstage/plugin-kubernetes-backend'));
  backend.add(import('@backstage/plugin-notifications-backend'));
  backend.add(import('@backstage/plugin-signals-backend'));

  // Tekton backend module
  backend.add(tektonBackendModule);

  await backend.start();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});