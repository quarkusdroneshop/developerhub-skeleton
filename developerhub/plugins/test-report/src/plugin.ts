import {
  createPlugin,
  createComponentExtension,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';

export const testReportPlugin = createPlugin({
  id: 'test-report',
  routes: {
    root: rootRouteRef,
  },
});

export const TestReportContent = testReportPlugin.provide(
  createComponentExtension({
    name: 'TestReportContent',
    component: {
      lazy: () =>
        import('./components/TestReportPage').then(m => m.TestReportContent),
    },
  }),
);
