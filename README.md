# 🎲 Discordボードゲーム

Discordで集まった友達とオンラインで遊べる、モノポリー風ターン制ボードゲーム。
ブラウザだけで動作し、Firebase (Firestore) にゲーム状態を保存するので、
数日〜数ヶ月放置しても同じURLから続きから再開できます。

## 構成

```
public/
  index.html        ロビー（部屋の作成 / 参加）
  room.html          ゲーム画面（盤面・交渉・GM操作）
  lobby.js           ロビーのロジック
  game.js            ゲーム本体のロジック（Firestoreとリアルタイム同期）
  board-data.js      盤面のマス定義・チャンスカード定義
  firebase-config.js Firebaseプロジェクトの接続情報（★要編集）
  style.css          デザイン
server.js            Renderで動かす簡易静的サーバー（Web Service用）
package.json
firestore.rules      Firestoreのセキュリティルール
```

## セットアップ手順

### 1. Firebaseプロジェクトを作る（完全無料）

1. https://console.firebase.google.com/ にアクセスし、新規プロジェクトを作成
2. 左メニュー **Authentication → Sign-in method** で **匿名** を有効化
   - これで名前を入れるだけで各プレイヤーが識別され、同じブラウザなら再開時も同じ人として復帰します
3. 左メニュー **Firestore Database** で「データベースの作成」→ 本番環境モード（リージョンは `asia-northeast1` がおすすめ）
4. **Firestore Database → ルール** タブを開き、このリポジトリの `firestore.rules` の内容を貼り付けて公開
5. 左上の ⚙️ →「プロジェクトの設定」→ 下部「マイアプリ」で `</>`（ウェブ）を選んでアプリを登録すると、
   `apiKey` などの設定値が表示されます
6. その値を `public/firebase-config.js` の該当箇所に貼り付けます

これでデータベースは **無料枠のままで自動削除もスリープもされません**（Firestoreは常時稼働のマネージドDBのため）。

### 2. ローカルで試す

```bash
npm install
npm start
# http://localhost:3000 を開く
```

`public/` フォルダを直接ブラウザで開くだけでも動作確認できますが、
Firebase Authのポップアップ等の関係で `npm start` 経由での確認を推奨します。

### 3. Renderに公開する

**方法A: Static Site（一番シンプル・推奨）**
1. GitHubにこのフォルダをpush
2. Renderのダッシュボードで **New → Static Site**
3. リポジトリを選択し、Publish directory に `public` を指定
4. デプロイ完了後に発行されるURL（例: `https://your-app.onrender.com`）がそのままゲームURL

**方法B: Web Service（server.js を使う場合）**
1. Renderで **New → Web Service**
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Free プランでOK（初回アクセス時に多少の起動待ちが発生することがありますが、
   ゲームデータはFirestore側に保存されているため消えることはありません）

### 4. Discordで遊ぶ

1. ホストが `https://your-app.onrender.com/` を開き、名前を入れて「部屋を作成する」
2. ゲーム画面右上の「Discord共有用リンクをコピー」を押してDiscordのチャンネルに貼る
3. 他のメンバーはリンクをクリック→名前を入力→「部屋に入る」
4. 進行役（GM）は「GMコマンド」パネルから、所持金やマス位置を自由に調整可能

## ゲームの仕組み（実装済み機能）

- **部屋作成・入室**: 6桁のランダムな部屋コードを発行、複数の部屋を同時に保持可能
- **サイコロ・盤面移動**: 2つのサイコロを振って移動、GO通過で+200
- **土地の所有・購入**: 未所有の土地に止まったら購入するか選択
- **家賃の自動徴収**: 他人の土地に止まると自動で家賃を支払い
- **チャンスマス**: ランダムでお金の増減やマス移動が発生
- **交渉機能**: 好きな相手にお金や自分の所有する土地を送れる
- **履歴表示**: 誰が何をしたかのログをリアルタイム表示
- **中断・再開**: 全状態がFirestoreに保存されるため、閉じても同じURLから再開可能
- **GMコマンド**: GM権限を持つプレイヤーが他プレイヤーの所持金・位置を強制変更できる

## 今後拡張しやすいポイント

- 交渉を「相手の承認待ち」にする（今は即時実行の一方的送金）
- 刑務所（お休みマス）や独占ボーナスなどモノポリー本来のルールの追加
- 部屋一覧・ルーム削除機能の追加
- ログのFirestoreサブコレクション化（現在は1ドキュメント内の配列なので、超長期運用ならおすすめ）
