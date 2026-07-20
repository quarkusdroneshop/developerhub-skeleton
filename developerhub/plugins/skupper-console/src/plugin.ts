import {
  createPlugin,
  createComponentExtension,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';

export const skupperConsolePlugin = createPlugin({
  id: 'skupper-console',
  routes: {
    root: rootRouteRef,
  },
});

export const SkupperConsoleContent = skupperConsolePlugin.provide(
  createComponentExtension({
    name: 'SkupperConsoleContent',
    component: {
      lazy: () =>
        import('./components/SkupperConsolePage').then(
          m => m.SkupperConsoleContent,
        ),
    },
  }),
);
