// firebase-config.js
//
// ★★★ ここを自分のFirebaseプロジェクトの値に書き換えてください ★★★
//
// 取得方法:
// 1. https://console.firebase.google.com/ で新規プロジェクトを作成
// 2. 左メニュー「Authentication」→「Sign-in method」→「匿名」を有効化
// 3. 左メニュー「Firestore Database」→本番環境モードでデータベース作成（リージョンは asia-northeast1 推奨）
// 4. プロジェクトの概要 ⚙️ →「プロジェクトの設定」→ 下の方の「マイアプリ」で
//    「</>」(ウェブ) アイコンをクリックしてアプリを追加すると、以下の値が表示されます。

const firebaseConfig = {
  apiKey: "AIzaSyB21-HpApq1ROP2GZbNS44ZDSQSYaqO8tE",
  authDomain: "board-795b2.firebaseapp.com",
  projectId: "board-795b2",
  storageBucket: "board-795b2.firebasestorage.app",
  messagingSenderId: "625378330822",
  appId: "1:625378330822:web:b2a4365b235a74fdc16fc7",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
