// server.js — publicフォルダを配信するだけのシンプルな静的サーバー
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

// SPA的な直リンク対策（例: /room?room=XXXX のような直接アクセスにも対応させたい場合）
app.get("/room", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "room.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
