# developerhub-skeleton

quarkusdroneshop ワークショップ用の RHDH (Red Hat Developer Hub) スケルトンリポジトリです。

## ディレクトリ構成

```
developerhub-skeleton/
├── skeleton/               # テンプレートから生成されるファイル群
│   ├── catalog-info.yaml   # Component エンティティ定義
│   ├── apis.yaml           # AsyncAPI エンティティ定義（サービス固有）
│   ├── kafka-apis.yaml     # 共有 Kafka トピック AsyncAPI 定義
│   └── resources.yaml      # Kafka/PostgreSQL Resource エンティティ定義
├── template.yaml           # RHDH Scaffolder テンプレート
├── developerhub/           # RHDH カスタムプラグイン
│   └── plugins/
│       └── test-report/    # テスト結果表示プラグイン
└── README.md               # このファイル
```

---

## テスト結果表示プラグイン (`plugin-test-report`)

コンポーネント詳細ページに **Test Report** タブを追加し、OpenShift 上のテストレポート HTML を iframe で表示するカスタム Dynamic Plugin です。

### URL 自動生成ルール

コンポーネント名 `quarkusdroneshop-{app}` から以下の URL を自動生成します：

```
http://{app}-test-report-quarkusdroneshop-cicd.apps.ocp.mnlq9.sandbox1332.opentlc.com
```

| コンポーネント | テストレポート URL |
|---|---|
| quarkusdroneshop-qdca10 | `http://qdca10-test-report-quarkusdroneshop-cicd.apps.ocp.mnlq9.sandbox1332.opentlc.com` |
| quarkusdroneshop-qdca10pro | `http://qdca10pro-test-report-quarkusdroneshop-cicd.apps.ocp.mnlq9.sandbox1332.opentlc.com` |
| quarkusdroneshop-inventory | `http://inventory-test-report-quarkusdroneshop-cicd.apps.ocp.mnlq9.sandbox1332.opentlc.com` |

---

## ビルド手順

### 前提条件

- Node.js 18 以上
- Yarn 4.x (`corepack enable && corepack prepare yarn@4.16.0 --activate`)

### 1. 依存パッケージのインストール

```bash
cd developerhub-skeleton/developerhub
yarn install
```

### 2. プラグインのビルド

```bash
# TypeScript コンパイル
yarn workspace @internal/plugin-test-report tsc

# バンドルビルド
yarn workspace @internal/plugin-test-report build
```

### 3. Dynamic Plugin 形式へのエクスポート

```bash
cd developerhub-skeleton/developerhub/plugins/test-report
yarn export-dynamic
```

`dist-dynamic/` ディレクトリに Dynamic Plugin 成果物が生成されます。

---

## RHDH へのデプロイ手順

### Step 1: Dynamic Plugin を RHDH Pod にコピー

```bash
# RHDH Pod 名を取得
RHDH_POD=$(oc get pod -n quarkusdroneshop-rhdh \
  -l app.kubernetes.io/component=backstage \
  -o jsonpath='{.items[0].metadata.name}')

# dist-dynamic/ を dynamic-plugins-root にコピー
oc cp developerhub/plugins/test-report/dist-dynamic/ \
  quarkusdroneshop-rhdh/${RHDH_POD}:/opt/app-root/src/dynamic-plugins-root/internal-plugin-test-report-0.1.0
```

### Step 2: app-config-rhdh.yaml の確認

`quarkusdroneshop-ansible/openshift/app-config-rhdh.yaml` の `dynamicPlugins.frontend` に以下が追記済みであることを確認します：

```yaml
dynamicPlugins:
  frontend:
    internal.plugin-test-report:
      mountPoints:
        - mountPoint: entity.page.test-report/cards
          importName: TestReportContent
          config:
            layout:
              gridColumn: "1 / -1"
      entityTabs:
        - path: /test-report
          title: Test Report
          mountPoint: entity.page.test-report
```

### Step 3: ConfigMap の更新と Pod 再起動

```bash
# app-config の ConfigMap を更新
oc create configmap app-config-rhdh \
  --from-file=app-config-rhdh.yaml=quarkusdroneshop-ansible/openshift/app-config-rhdh.yaml \
  -n quarkusdroneshop-rhdh \
  --dry-run=client -o yaml | oc apply -f -

# RHDH を再起動
oc rollout restart deployment/developer-hub -n quarkusdroneshop-rhdh
oc rollout status deployment/developer-hub -n quarkusdroneshop-rhdh
```

---

## Scaffolder テンプレートの使い方

RHDH の Scaffolder から `quarkusdroneshop-{app}` コンポーネントを登録すると、以下が自動で実行されます：

1. GitHub リポジトリに `catalog-info.yaml`、`apis.yaml`、`kafka-apis.yaml`、`resources.yaml` を配置
2. Component / API / Resource エンティティをカタログに登録
3. `quarkusdroneshop-cicd` namespace に PipelineRun を作成してビルド実行

### 登録されるエンティティの関係図

```
Component (quarkusdroneshop-{app})
 ├─ consumesApis  → AsyncAPI (Kafka 消費トピック)
 ├─ providesApis  → AsyncAPI (Kafka 送信トピック)
 └─ dependsOn
      ├─ resource:shop-cluster-kafka
      ├─ resource:kafka-topic-*
      └─ resource:droneshopdb-postgresql  (counter/homeoffice/inventory のみ)
```
