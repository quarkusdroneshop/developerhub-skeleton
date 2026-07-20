import { useState } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';

// script/ocpdeploy.sh `skupper console` が Skupper Network Observer を
// デプロイする先の Namespace(サイト)一覧。エンティティ側で
// `skupper.io/console-namespace` アノテーションが指定されていればそちらを優先する。
const DEFAULT_CONSOLE_NAMESPACE = 'quarkusdroneshop-demo';

// テストレポートプラグイン (rhdh-plugin-test-report) と同じく、RHDH が
// マルチクラスタ構成のため、エンティティの `backstage.io/kubernetes-cluster`
// からドメインを解決する。RHDH 自身のクラスタと異なるクラスタの Skupper
// コンソールを見る場合は、このマップを実クラスタのドメインに更新する。
const CLUSTER_DOMAINS: Record<string, string> = {
  'a-cluster': 'apps.ocp.hnkwm.sandbox225.opentlc.com',
  'b-cluster': 'apps.ocp.mnlq9.sandbox1332.opentlc.com',
  'c-cluster': 'apps.ocp.49dgc.sandbox1447.opentlc.com',
};

function extractDomain(baseUrl: string): string {
  const match = baseUrl.match(/https?:\/\/[^/]+?\.(apps\..+)/);
  return match ? match[1] : baseUrl.replace(/^https?:\/\/[^/]+\/.*$/, '');
}

function getSkupperConsoleUrl(
  namespace: string,
  cluster: string | undefined,
  defaultDomain: string,
): string {
  const domain = (cluster && CLUSTER_DOMAINS[cluster]) ?? defaultDomain;
  return `https://skupper-network-observer-${namespace}.${domain}`;
}

export const SkupperConsoleContent = () => {
  const { entity } = useEntity();
  const config = useApi(configApiRef);
  const [loadFailed, setLoadFailed] = useState(false);

  const cluster = entity.metadata.annotations?.['backstage.io/kubernetes-cluster'];
  const namespace =
    entity.metadata.annotations?.['skupper.io/console-namespace'] ??
    DEFAULT_CONSOLE_NAMESPACE;
  const defaultDomain = extractDomain(config.getString('app.baseUrl'));
  const consoleUrl = getSkupperConsoleUrl(namespace, cluster, defaultDomain);

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '16px' }}>Skupper ネットワークコンソール</h2>

      <div
        style={{
          padding: '16px',
          background: '#f5f5f5',
          borderRadius: '8px',
          marginBottom: '16px',
          wordBreak: 'break-all',
        }}
      >
        <strong>URL: </strong>
        <a href={consoleUrl} target="_blank" rel="noopener noreferrer">
          {consoleUrl}
        </a>
      </div>

      {!loadFailed ? (
        <iframe
          title="Skupper Network Console"
          src={consoleUrl}
          style={{
            width: '100%',
            height: '75vh',
            border: '1px solid #ddd',
            borderRadius: '8px',
          }}
          onError={() => setLoadFailed(true)}
        />
      ) : (
        <p style={{ color: '#888' }}>
          コンソールを埋め込み表示できませんでした。上の URL から新しいタブで開いてください。
        </p>
      )}

      <div style={{ marginTop: '16px' }}>
        <p style={{ color: '#555', fontSize: '13px' }}>
          ※ Skupper Network Observer が対象 Namespace にデプロイされている必要があります
          (<code>./script/ocpdeploy.sh skupper console</code>)。<br />
          ※ ブラウザや Route の設定によっては X-Frame-Options / CSP で埋め込みがブロックされる場合があります。
          その場合は上のリンクから新しいタブで開いてください。
        </p>
      </div>
    </div>
  );
};
