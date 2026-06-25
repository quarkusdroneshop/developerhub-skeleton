import {
  createPlugin,
  createComponentExtension,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';

export const dataCatalogPlugin = createPlugin({
  id: 'data-catalog',
  routes: {
    root: rootRouteRef,
  },
});

export const DataCatalogContent = dataCatalogPlugin.provide(
  createComponentExtension({
    name: 'DataCatalogContent',
    component: {
      lazy: () =>
        import('./components/DataCatalogPage').then(m => m.DataCatalogContent),
    },
  }),
);
