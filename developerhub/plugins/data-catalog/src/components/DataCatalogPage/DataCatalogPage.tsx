import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';

function getOpenMetadataUrls(appBaseUrl: string): { direct: string; proxy: string } {
  // app.baseUrl = https://backstage-developer-hub-<ns>.<apps-domain>
  // → OpenMetadata direct = http://openmetadata-openmetadata.<apps-domain>
  // → OpenMetadata proxy  = https://om-proxy-openmetadata.<apps-domain>
  const appsHost = appBaseUrl.replace(/^https?:\/\/[^.]+\./, '');
  return {
    direct: `http://openmetadata-openmetadata.${appsHost}`,
    proxy:  `https://om-proxy-openmetadata.${appsHost}`,
  };
}

const DB_PATHS: Record<string, string> = {
  'a-cluster': '/service/databaseServices/external-shop-cluster-postgres-asite%3A5432?showDeletedTables=false',
  'b-cluster': '/service/databaseServices/external-shop-cluster-postgres-bsite%3A5432?showDeletedTables=false',
  'c-cluster': '/service/databaseServices/external-shop-cluster-postgres-csite%3A5432?showDeletedTables=false',
};

const KAFKA_SERVICE: Record<string, string> = {
  'a-cluster': 'external-shop-cluster-kafka-asite%3A9094',
  'b-cluster': 'external-shop-cluster-kafka-bsite%3A9094',
  'c-cluster': 'external-shop-cluster-kafka-csite%3A9094',
};

function getUrls(entity: any, appBaseUrl: string): { iframeUrl: string; directUrl: string } {
  const { direct: OPENMETADATA_DIRECT, proxy: OPENMETADATA_PROXY } = getOpenMetadataUrls(appBaseUrl);
  const annotation = entity.metadata.annotations?.['openmetadata/explore-url'];
  const system: string = entity.spec?.system ?? 'a-cluster';
  const type: string = entity.spec?.type ?? '';

  let directUrl: string;
  if (annotation) {
    directUrl = annotation;
  } else if (type === 'asyncapi') {
    // エンティティ名 "kafka-{topic}" からトピック名を抽出
    const entityName: string = entity.metadata.name ?? '';
    const topicName = entityName.replace(/^kafka-/, '');
    const kafkaService = KAFKA_SERVICE[system] ?? KAFKA_SERVICE['a-cluster'];
    directUrl = `${OPENMETADATA_DIRECT}/topic/${kafkaService}.${topicName}/schema`;
  } else {
    const path = DB_PATHS[system] ?? DB_PATHS['a-cluster'];
    directUrl = `${OPENMETADATA_DIRECT}${path}`;
  }

  const iframeUrl = directUrl.replace(OPENMETADATA_DIRECT, OPENMETADATA_PROXY);
  return { iframeUrl, directUrl };
}

export const DataCatalogContent = () => {
  const { entity } = useEntity();
  const config = useApi(configApiRef);
  const appBaseUrl = config.getString('app.baseUrl');
  const { iframeUrl, directUrl } = getUrls(entity, appBaseUrl);

  return (
    <div style={{ position: 'relative' }}>
      <a
        href={directUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 10,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 10px',
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid #ccc',
          borderRadius: 4,
          fontSize: 12,
          color: '#333',
          textDecoration: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      >
        ↗ 別タブで開く
      </a>
      <iframe
        src={iframeUrl}
        style={{
          width: '100%',
          height: 'calc(100vh - 200px)',
          minHeight: '600px',
          border: 'none',
          display: 'block',
        }}
        title="OpenMetadata データカタログ"
      />
    </div>
  );
};
