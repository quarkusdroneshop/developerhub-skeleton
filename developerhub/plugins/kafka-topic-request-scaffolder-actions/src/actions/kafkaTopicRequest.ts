import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import type { Config } from '@backstage/config';
import {
  approveTask,
  buildRequestMessage,
  sendChatMessage,
} from '../kafkaChatClient';

export function createKafkaTopicRequestAction(config: Config) {
  return createTemplateAction({
    id: 'kafka:topic:request',
    description:
      'AI Agent に Kafka トピック作成を依頼し、承認が必要な場合は自動で承認する',
    schema: {
      input: {
        topicName: z => z.string().describe('作成するトピック名'),
        site: z => z.string().describe('対象サイト'),
        comment: z => z.string().optional().describe('追加コメント'),
        repoSlug: z => z.string().optional().describe('対象リポジトリ'),
      },
      output: {
        reply: z => z.string().describe('AI Agent からの最終応答'),
      },
    },
    async handler(ctx) {
      const baseUrl =
        config.getOptionalString('aiAgent.baseUrl') ??
        config.getOptionalString('kafkaTopicRequest.apiBaseUrl');
      if (!baseUrl) {
        throw new Error(
          'AI Agent の接続先 (app-config.yaml の aiAgent.baseUrl) が設定されていません。',
        );
      }

      const { topicName, site, comment, repoSlug } = ctx.input;
      const threadId = crypto.randomUUID();
      const message = buildRequestMessage(
        topicName,
        site,
        repoSlug,
        comment ?? '',
      );

      ctx.logger.info(`AI Agent へ依頼を送信しています: ${topicName}`);
      const res = await sendChatMessage(baseUrl, message, threadId, status => {
        ctx.logger.info(status);
      });

      let reply = res.reply;
      if (res.requires_approval) {
        ctx.logger.info('承認待ちのため自動承認します...');
        const approveRes = await approveTask(baseUrl, threadId);
        reply = approveRes.reply ?? approveRes.status;
      }

      ctx.logger.info(reply);
      ctx.output('reply', reply);
    },
  });
}
