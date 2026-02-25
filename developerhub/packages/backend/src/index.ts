import { createBackend } from '@backstage/backend-defaults';
import { createScaffolderBackend } from '@backstage/plugin-scaffolder-backend';
import { createFilesystemWriteAction } from '@backstage/plugin-scaffolder-backend';
import { createGithubAction } from '@backstage/plugin-scaffolder-backend-module-github';
import { createKubernetesApplyAction } from '@backstage/plugin-scaffolder-backend-module-kubernetes';
import { createTektonActions } from '@backstage/community-plugin-scaffolder-backend-module-tekton';

async function main() {
  const backend = createBackend({});

  // 基本プラグイン
  backend.add(await import('@backstage/plugin-app-backend'));
  backend.add(await import('@backstage/plugin-proxy-backend'));

  // Scaffolder backend の作成
  const scaffolder = createScaffolderBackend({
    logger: backend.logger,
    config: backend.config,
    actions: [
      createFilesystemWriteAction(), // filesystem:write
      createGithubAction(),          // GitHub アクション
      createKubernetesApplyAction(), // Kubernetes apply アクション
      ...createTektonActions(),      // Tekton ワークフローアクション
    ],
  });

  backend.add(scaffolder);

  // 他のモジュール
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

  // バックエンド起動
  await backend.start();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});