import { useEntity } from '@backstage/plugin-catalog-react';

const BASE_DOMAIN = 'apps.ocp.mnlq9.sandbox1332.opentlc.com';
const NAMESPACE = 'quarkusdroneshop-cicd';

function getTestReportUrl(entityName: string): string {
  const appName = entityName.replace(/^quarkusdroneshop-/, '');
  return `http://${appName}-test-report-${NAMESPACE}.${BASE_DOMAIN}`;
}

export const TestReportContent = () => {
  const { entity } = useEntity();
  const url = getTestReportUrl(entity.metadata.name);

  return (
    <div style={{ padding: '0', height: '100%' }}>
      <iframe
        src={url}
        title="Test Report"
        style={{
          width: '100%',
          height: 'calc(100vh - 200px)',
          border: 'none',
          display: 'block',
        }}
      />
    </div>
  );
};
