# Test Report Plugin - ビルド & デプロイ手順

## 1. 依存パッケージインストール

```bash
cd rhdh-plugin-test-report
yarn install
```

## 2. Dynamic Plugin としてビルド

```bash
yarn build
yarn export-dynamic
```

`dist-dynamic/` ディレクトリが生成される。

## 3. RHDH へのデプロイ

### Option A: OpenShift の PVC/ConfigMap 経由

```bash
# dist-dynamic/ を quarkusdroneshop-rhdh namespace の PVC にコピー
oc cp dist-dynamic/ quarkusdroneshop-rhdh/<rhdh-pod>:/opt/app-root/src/dynamic-plugins-root/internal-plugin-test-report-0.1.0
```

### Option B: npm registry 経由

```bash
# npm pack してローカルレジストリに publish
yarn pack
# Nexus / Artifactory 等にアップロード後、app-config-rhdh.yaml の
# dynamic-plugins に package: <registry-url> を指定
```

## 4. app-config-rhdh.yaml の反映

`rhdh-config.yaml` の内容はすでに
`quarkusdroneshop-ansible/openshift/app-config-rhdh.yaml` に追記済み。

ConfigMap を更新して RHDH Pod を再起動する:

```bash
oc apply -f quarkusdroneshop-ansible/openshift/app-config-rhdh.yaml -n quarkusdroneshop-rhdh
oc rollout restart deployment/developer-hub -n quarkusdroneshop-rhdh
```

## URL パターン

コンポーネント名 `quarkusdroneshop-{app}` から自動的に以下 URL を生成:

```
http://{app}-test-report-quarkusdroneshop-cicd.apps.ocp.mnlq9.sandbox1332.opentlc.com
```

| コンポーネント | URL |
|---|---|
| quarkusdroneshop-qdca10 | http://qdca10-test-report-quarkusdroneshop-cicd.apps.ocp.mnlq9.sandbox1332.opentlc.com |
| quarkusdroneshop-qdca10pro | http://qdca10pro-test-report-quarkusdroneshop-cicd.apps.ocp.mnlq9.sandbox1332.opentlc.com |
| quarkusdroneshop-inventory | http://inventory-test-report-quarkusdroneshop-cicd.apps.ocp.mnlq9.sandbox1332.opentlc.com |
