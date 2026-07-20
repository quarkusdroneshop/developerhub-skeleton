import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';
import { createKafkaTopicRequestAction } from './actions/kafkaTopicRequest';

export const kafkaTopicRequestScaffolderModule = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'kafka-topic-request',
  register(reg) {
    reg.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
      },
      async init({ scaffolder, config }) {
        scaffolder.addActions(createKafkaTopicRequestAction(config));
      },
    });
  },
});

export default kafkaTopicRequestScaffolderModule;
