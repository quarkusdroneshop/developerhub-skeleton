import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';

const OPENMETADATA_EXPLORE_URL =
  'http://openmetadata-openmetadata.apps.ocp.hfczn.sandbox2320.opentlc.com/explore?quickFilter=%7B%22query%22%3A%7B%22bool%22%3A%7B%22must%22%3A%5B%7B%22bool%22%3A%7B%22should%22%3A%5B%7B%22term%22%3A%7B%22serviceType%22%3A%22postgres%22%7D%7D%5D%7D%7D%2C%7B%22bool%22%3A%7B%22should%22%3A%5B%7B%22term%22%3A%7B%22service.displayName.keyword%22%3A%22external-shop-cluster-postgres-asite%3A5432%22%7D%7D%5D%7D%7D%2C%7B%22bool%22%3A%7B%22should%22%3A%5B%7B%22term%22%3A%7B%22database.displayName%22%3A%22droneshopdb%22%7D%7D%5D%7D%7D%2C%7B%22bool%22%3A%7B%22should%22%3A%5B%7B%22term%22%3A%7B%22databaseSchema.displayName%22%3A%22droneshop%22%7D%7D%5D%7D%7D%2C%7B%22bool%22%3A%7B%22should%22%3A%5B%7B%22term%22%3A%7B%22entityType.keyword%22%3A%22table%22%7D%7D%5D%7D%7D%5D%7D%7D%7D&page=1&size=15';

function getExploreUrl(entity: any, baseUrl: string): string {
  const annotation = entity.metadata.annotations?.['openmetadata/explore-url'];
  if (annotation) return annotation;
  return OPENMETADATA_EXPLORE_URL;
}

export const DataCatalogContent = () => {
  const { entity } = useEntity();
  const config = useApi(configApiRef);
  const baseUrl = config.getString('app.baseUrl');
  const exploreUrl = getExploreUrl(entity, baseUrl);

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '16px' }}>データカタログ</h2>

      <div style={{
        padding: '16px',
        background: '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '24px',
        wordBreak: 'break-all',
      }}>
        <strong>OpenMetadata URL: </strong>
        <a href={exploreUrl} target="_blank" rel="noopener noreferrer">
          {exploreUrl}
        </a>
      </div>

      <a
        href={exploreUrl}
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
        データカタログを開く ↗
      </a>

      <div style={{ marginTop: '32px' }}>
        <p style={{ color: '#555', fontSize: '13px' }}>
          ※ セキュリティポリシー（Mixed Content）のため、HTTPS の RHDH ページ内に
          HTTP の OpenMetadata を直接埋め込むことができません。<br />
          上のボタンから新しいタブで開いてください。
        </p>
      </div>
    </div>
  );
};
