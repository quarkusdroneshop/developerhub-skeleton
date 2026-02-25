import { createBackend } from '@backstage/backend-defaults';
import { createScaffolderBackend } from '@backstage/plugin-scaffolder-backend';
import { createFilesystemWriteAction } from '@backstage/plugin-scaffolder-backend';

async function main() {
  const backend = createBackend({});

  backend.add(await import('@backstage/plugin-app-backend'));
  backend.add(await import('@backstage/plugin-proxy-backend'));

  // Scaffolder backend の作成
  const scaffolder = createScaffolderBackend({
    logger: backend.logger,
    config: backend.config,
  });

  // アクション追加
  scaffolder.addActions([createFilesystemWriteAction()]);

  backend.add(scaffolder);

  // 他のモジュール
  backend.add(await import('@backstage/plugin-scaffolder-backend-module-github'));
  backend.add(await import('@backstage/plugin-scaffolder-backend-module-kubernetes'));
  backend.add(await import('@backstage/community-plugin-scaffolder-backend-module-tekton'));

  backend.add(await import('@backstage/plugin-techdocs-backend'));
  backend.add(await import('@backstage/plugin-auth-backend'));
  backend.add(await import('@backstage/plugin-auth-backend-module-guest-provider'));
  backend.add(await import('@backstage/plugin-catalog-backend'));
  backend.add(await import('@backstage/plugin-permission-backend'));
  backend.add(await import('@backstage/plugin-search-backend'));
  backend.add(await import('@backstage/plugin-kubernetes-backend'));
  backend.add(await import('@backstage/plugin-notifications-backend'));
  backend.add(await import('@backstage/plugin-signals-backend'));
  backend.add(await import('@backstage/community-plugin-tekton-backend'));

  await backend.start();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});