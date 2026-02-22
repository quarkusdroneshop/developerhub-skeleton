import { createHttpRequestAction } 
  from '@roadiehq/scaffolder-backend-module-http-request';

backend.add(
  createScaffolderPlugin({
    actions: [
      createHttpRequestAction(),
    ],
  }),
);