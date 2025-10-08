# モジュラーマルチデータベースアプリケーション

## システム構成

### 4つのサービス

- **User Module** (Port: 4000) - ユーザー管理 / DB: `user.db`
- **Screening Module** (Port: 4001) - スクリーニング管理 / DB: `screening.db`
- **Admin Frontend** (Port: 3000) - 管理者用ダッシュボード
- **Customer Frontend** (Port: 3001) - 顧客用ダッシュボード

### データベース

各モジュールが独立したSQLiteデータベースを持つ
- User Module: `user.db`
- Screening Module: `screening.db`

## サンプルワークフロー

1. **ユーザー登録** (Customer Frontend → User Module)
   - `POST http://localhost:4000/api/users/signup`
   - ユーザーステータス: `PENDING`

2. **スクリーニング申請** (Customer Frontend → Screening Module)
   - `POST http://localhost:4001/api/screenings/apply`
   - スクリーニングステータス: `PENDING`

3. **スクリーニング審査** (Admin Frontend → Screening Module)
   - `POST http://localhost:4001/api/screenings/:id/pass`
   - スクリーニングステータス: `PENDING` → `PASSED`
   - ドメインイベント `screening.passed` を発行

4. **ユーザーアクティベーション** (Screening Module → User Module)
   - イベント送信: `POST http://localhost:4000/api/events`
   - User Moduleがイベントを受信
   - ユーザーステータス: `PENDING` → `ACTIVE`
