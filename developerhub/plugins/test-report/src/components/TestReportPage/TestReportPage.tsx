import { useEffect, useState } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';

const CLUSTER_DOMAINS: Record<string, string> = {
  'a-cluster': 'apps.ocp.hnkwm.sandbox225.opentlc.com',
  'b-cluster': 'apps.ocp.mnlq9.sandbox1332.opentlc.com',
  'c-cluster': 'apps.ocp.49dgc.sandbox1447.opentlc.com',
};
const NAMESPACE = 'quarkusdroneshop-cicd';

function extractDomain(baseUrl: string): string {
  const match = baseUrl.match(/https?:\/\/[^/]+?\.(apps\..+)/);
  return match ? match[1] : baseUrl.replace(/^https?:\/\/[^/]+\/.*$/, '');
}

function getTestReportUrl(entityName: string, cluster: string | undefined, defaultDomain: string): string {
  const appName = entityName.replace(/^quarkusdroneshop-/, '');
  const domain = (cluster && CLUSTER_DOMAINS[cluster]) ?? defaultDomain;
  return `http://${appName}-test-report-${NAMESPACE}.${domain}`;
}

export const TestReportContent = () => {
  const { entity } = useEntity();
  const config = useApi(configApiRef);
  const [available, setAvailable] = useState<boolean | null>(null);
  const cluster = entity.metadata.annotations?.['backstage.io/kubernetes-cluster'];
  const defaultDomain = extractDomain(config.getString('app.baseUrl'));
  const reportUrl = getTestReportUrl(entity.metadata.name, cluster, defaultDomain);

  useEffect(() => {
    setAvailable(null);
    fetch(reportUrl, { method: 'HEAD', mode: 'no-cors' })
      .then(() => setAvailable(true))
      .catch(() => setAvailable(false));
  }, [reportUrl]);

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '16px' }}>テストレポート</h2>

      <div style={{
        padding: '16px',
        background: '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '24px',
        wordBreak: 'break-all',
      }}>
        <strong>URL: </strong>
        <a href={reportUrl} target="_blank" rel="noopener noreferrer">
          {reportUrl}
        </a>
      </div>

      <a
        href={reportUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          padding: '10px 24px',
          background: '#1976d2',
          color: '#fff',
          borderRadius: '4px',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '14px',
        }}
      >
        テストレポートを開く ↗
      </a>

      {available === false && (
        <p style={{ marginTop: '16px', color: '#888' }}>
          ※ テストレポートがまだ生成されていないか、サービスが起動していない可能性があります。
        </p>
      )}

      <div style={{ marginTop: '32px' }}>
        <p style={{ color: '#555', fontSize: '13px' }}>
          ※ セキュリティポリシー（Mixed Content）のため、HTTPS の RHDH ページ内に
          HTTP のテストレポートを直接埋め込むことができません。<br />
          上のボタンから新しいタブで開いてください。
        </p>
      </div>
    </div>
  );
};
