export interface ChatResponse {
  thread_id: string;
  reply: string;
  intent: string;
  active_agent: string;
  requires_approval: boolean;
  approval_action: string;
  token_usage: number;
}

/**
 * /api/v1/chat は SSE (text/event-stream) で応答する。3秒以上かかる場合は
 * 途中経過として {"status": "..."} だけを含むイベントが挟まることがあり、
 * 最終結果には "reply" が含まれる。
 */
export async function sendChatMessage(
  baseUrl: string,
  message: string,
  threadId: string,
  onStatus?: (status: string) => void,
): Promise<ChatResponse> {
  const res = await fetch(`${baseUrl}/api/v1/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      thread_id: threadId,
      enable_thinking: false,
      max_tokens_level: 'low',
    }),
  });
  if (!res.ok || !res.body) {
    throw new Error(`chat request failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sepIndex: number;
    while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, sepIndex);
      buffer = buffer.slice(sepIndex + 2);
      const dataLine = rawEvent
        .split('\n')
        .find(line => line.startsWith('data:'));
      if (!dataLine) continue;
      const payload = JSON.parse(dataLine.slice(5).trim());
      if (payload.error) {
        throw new Error(payload.error);
      }
      if (payload.status && !payload.reply) {
        onStatus?.(payload.status);
        continue;
      }
      return payload as ChatResponse;
    }
  }
  throw new Error('chat request failed: empty stream');
}

export async function approveTask(
  baseUrl: string,
  threadId: string,
): Promise<{ thread_id: string; status: string; reply?: string }> {
  const res = await fetch(`${baseUrl}/api/v1/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ thread_id: threadId, approved: true }),
  });
  if (!res.ok) {
    throw new Error(`approve request failed: ${res.status}`);
  }
  return res.json();
}

export function buildRequestMessage(
  topicName: string,
  site: string,
  repoSlug: string | undefined,
  comment: string,
): string {
  const lines = [
    'Developer Hub からのトピック作成依頼です。',
    `トピック名: ${topicName}`,
    `対象サイト: ${site}`,
  ];
  if (repoSlug) {
    lines.push(`対象リポジトリ: ${repoSlug}`);
  }
  lines.push(`追加コメント: ${comment.trim() || '(なし)'}`);
  lines.push(
    'このトピックが対象サイトの実ブローカーに既に存在する場合は何もせず、' +
      '存在しない場合のみ、追加コメントおよび対象リポジトリのソースコード/README' +
      'から説明文を組み立てた上で新規作成してください。',
  );
  return lines.join('\n');
}
