# 🏗️ モジュラーマルチデータベースアプリケーション

ドメイン駆動設計(DDD)とイベント駆動アーキテクチャを採用したマイクロサービスアプリケーション

## 📋 目次

- [システム構成](#-システム構成)
- [ワークフロー](#-ワークフロー)
- [アーキテクチャ](#-アーキテクチャ)
- [技術スタック](#-技術スタック)
- [セットアップ](#-セットアップ)

## 🏛️ システム構成

### バックエンド

#### 👤 User Module (Port: 4000)
- **役割**: ユーザー管理
- **データベース**: SQLite (`user.db`)
- **主な機能**:
  - ✨ ユーザー登録 (Signup)
  - ✅ ユーザーアクティベーション
  - 📨 イベント受信 (スクリーニング合格通知)

#### 🔍 Screening Module (Port: 4001)
- **役割**: スクリーニング管理
- **データベース**: SQLite (`screening.db`)
- **主な機能**:
  - 📝 スクリーニング申請
  - ✅ スクリーニング審査 (合格/不合格)
  - 📤 ドメインイベント発行

### フロントエンド

#### 👨‍💼 Admin Frontend (Port: 3000)
- **役割**: 管理者用ダッシュボード
- **機能**: スクリーニング審査

#### 🧑‍💼 Customer Frontend (Port: 3001)
- **役割**: 顧客用ダッシュボード
- **機能**: ユーザー登録、スクリーニング申請

## 🔄 ワークフロー

\`\`\`
📱 Customer Frontend (Port: 3001)
    ↓
    1️⃣ ユーザー登録 (POST /api/users/signup)
    ↓
👤 User Module
    └─ User Entity
        ├─ ID生成 (Domain Layer)
        ├─ バリデーション (不変条件)
        ├─ status: PENDING
        └─ Domain Event: user.signed_up 📨
    ↓
    2️⃣ スクリーニング申請 (POST /api/screenings/apply)
    ↓
🔍 Screening Module
    └─ Screening Entity
        ├─ ID生成 (Domain Layer)
        ├─ バリデーション (不変条件)
        ├─ status: PENDING
        └─ Domain Event: screening.applied 📨
    ↓
💻 Admin Frontend (Port: 3000)
    ↓
    3️⃣ スクリーニング審査 (POST /api/screenings/:id/pass)
    ↓
🔍 Screening Module
    └─ Screening Entity
        ├─ 状態遷移: PENDING → PASSED ✅
        ├─ ガード条件チェック
        └─ Domain Event: screening.passed 📨
    ↓
    4️⃣ HTTP Event 送信 (POST http://localhost:4000/api/events)
    ↓
👤 User Module
    └─ Event Handler
        ├─ screening.passed イベント受信 📥
        └─ User Entity
            ├─ 状態遷移: PENDING → ACTIVE ✅
            └─ Domain Event: user.activated 📨
\`\`\`

## 🏗️ アーキテクチャ

### DDD レイヤー構造

\`\`\`
📁 backend/modules/{module}/src/
├── 🎨 presentation/        # プレゼンテーション層
│   ├── controllers/        # HTTPリクエスト処理
│   └── routes/             # ルーティング定義
│
├── 💼 application/         # アプリケーション層
│   ├── use-cases/          # ユースケース
│   └── event-handlers/     # イベントハンドラ
│
├── 🎯 domain/              # ドメイン層
│   ├── entities/           # エンティティ (ビジネスロジック)
│   │   ├── domain-model.base.ts  # 共通ベースクラス
│   │   └── *.entity.ts     # 各エンティティ
│   ├── events/             # ドメインイベント定義
│   └── repositories/       # リポジトリインターフェース
│
└── 🔧 infrastructure/      # インフラストラクチャ層
    ├── database/           # Prisma Client
    ├── repositories/       # リポジトリ実装
    ├── events/             # イベント発行実装
    ├── external/           # 外部API クライアント
    └── di/                 # 依存性注入コンテナ
\`\`\`

### 🎯 ドメインモデルの特徴

#### DomainModel Base Class
すべてのエンティティが継承する基底クラス:

\`\`\`typescript
abstract class DomainModel {
  // 📨 ドメインイベント管理
  - getDomainEvents()
  - clearDomainEvents()
  - addDomainEvent()

  // 🆔 ID生成 (インフラに依存しない)
  - generateId()
}
\`\`\`

#### Entity の責務

**🔒 不変条件 (Invariants)**
- プライベート \`validate()\` メソッドで実装
- コンストラクタで必ず呼び出される

**🏭 生成ルール (Factory Methods)**
- \`static signup()\`, \`static apply()\` など
- ビジネスルールを含む
- ドメインイベントを生成

**♻️ 状態遷移 (State Transitions)**
- \`activate()\`, \`pass()\`, \`reject()\` など
- ガード条件でバリデーション
- ドメインイベントを発行

**🔄 再構築 (Reconstruction)**
- \`static reconstruct()\` メソッド
- 永続化層からの復元用
- ビジネスルールをバイパス

### 📨 イベント駆動アーキテクチャ

#### ドメインイベント

\`\`\`typescript
enum DomainEventName {
  USER_SIGNED_UP = 'user.signed_up',
  USER_ACTIVATED = 'user.activated',
  SCREENING_APPLIED = 'screening.applied',
  SCREENING_PASSED = 'screening.passed',
}

interface DomainEvent {
  eventName: DomainEventName;
  occurredOn: Date;
  data: any;
}
\`\`\`

#### イベントフロー

1. **エンティティ**: 状態遷移時にドメインイベントを生成
2. **ユースケース**: エンティティからイベントを取得
3. **イベント発行者**: HTTPでイベントを他モジュールに送信
4. **イベントハンドラ**: イベントを受信して処理

## 🛠️ 技術スタック

### Backend
- **Runtime**: Node.js + TypeScript
- **Web Framework**: Hono
- **ORM**: Prisma
- **Database**: SQLite (モジュールごとに独立)
- **Validation**: Zod

### Frontend
- **Framework**: Next.js 14 (App Router)
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form
- **Styling**: Tailwind CSS

## 🚀 セットアップ

### 前提条件
- Node.js 18+
- npm または yarn

### インストール

\`\`\`bash
# ルートディレクトリで
npm install

# Prisma クライアント生成
cd backend/modules/user
npx prisma generate
npx prisma migrate dev

cd ../screening
npx prisma generate
npx prisma migrate dev
\`\`\`

### 起動

#### バックエンド

\`\`\`bash
# User Module (Port 4000)
cd backend/modules/user
npm run dev

# Screening Module (Port 4001)
cd backend/modules/screening
npm run dev
\`\`\`

#### フロントエンド

\`\`\`bash
# Admin Frontend (Port 3000)
cd frontend/admin
npm run dev

# Customer Frontend (Port 3001)
cd frontend/customer
npm run dev
\`\`\`

## 📝 API エンドポイント

### User Module (Port 4000)
- \`POST /api/users/signup\` - ユーザー登録
- \`GET /api/users/:id\` - ユーザー取得
- \`POST /api/events\` - イベント受信 (Internal)

### Screening Module (Port 4001)
- \`POST /api/screenings/apply\` - スクリーニング申請
- \`GET /api/screenings/list\` - スクリーニング一覧
- \`POST /api/screenings/:id/pass\` - スクリーニング合格

## 🎨 設計パターン

- ✅ **Domain-Driven Design (DDD)**: ドメインロジックをエンティティに集約
- ✅ **Event-Driven Architecture**: ドメインイベントによる疎結合
- ✅ **Repository Pattern**: 永続化の抽象化
- ✅ **Factory Pattern**: エンティティ生成ルールのカプセル化
- ✅ **Dependency Injection**: 依存関係の管理

## 📄 ライセンス

MIT
