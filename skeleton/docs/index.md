# quarkusdroneshop-reward マイクロサービス

## 概要

quarkusdroneshop-reward はドローンショップの **新規マイクロサービスのスケルトン** です。

**フレームワーク**: Quarkus

---

## アーキテクチャ

```
Kafka: [incoming-topic]
        │
        ▼
┌──────────────────┐
│  reward service  │
└──────────────────┘
        │
        ▼
Kafka: [outgoing-topic]
```

---

## ローカル開発

### 前提条件

- Java 21+
- Docker / Docker Compose

### アプリケーション起動

```shell
./mvnw clean compile quarkus:dev
```

---

## テスト

```shell
# ユニットテスト(ArchUnit含む)
./mvnw test

# 統合テスト（Jacoco含む）
./mvnw verify

# チェックスタイル
./mvnw checkstyle:check

# PMD
./mvnw pmd:pmd

# SpotBugs
./mvnw spotbugs:spotbugs

# semgrep
semgrep scan --config p/default --json > target/semgrep-results.json

# secret scan
gitleaks detect --source . --report-format json --report-path target/gitleaks-report.json --exit-code 1

# 脆弱性テスト
trivy fs --scanners vuln,secret,misconfig,license --exit-code=1 --ignorefile ./.trivyignore.yaml ./ > target/trivy.txt

# セキュリティテスト
mvn quarkus:dev > quarkus.log 2>&1 & QUARKUS_PID=$!; sleep 10; wapiti -u http://localhost:8080 -f json -o ./target/wapiti.json; kill $QUARKUS_PID

# テストレポートの作成
./mvnw exec:exec@generate-report
```

---

## 注意事項

- このプロジェクトは新規マイクロサービス開発用のスケルトンです。
- `src/main/` 配下にビジネスロジックを実装してください。
- `src/test/archtecter/` にアーキテクチャテストを配置してください。
- `src/test/e2e/` にE2Eテストを配置してください。
