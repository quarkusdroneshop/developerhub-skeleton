import { createBackend } from '@backstage/backend-common';
// 他の import も適宜

export default async function main() {
  const backend = await createBackend();

  backend.add(
    await import('@roadiehq/scaffolder-backend-module-http-request')
  );

  await backend.start();
}
