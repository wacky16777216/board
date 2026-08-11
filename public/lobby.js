// lobby.js
const START_MONEY = 1500;
const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // 紛らわしい文字を除外

function genRoomId(len = 6) {
  let out = "";
  for (let i = 0; i < len; i++) out += CHARS[Math.floor(Math.random() * CHARS.length)];
  return out;
}

const tabCreate = document.getElementById("tabCreate");
const tabJoin = document.getElementById("tabJoin");
const paneCreate = document.getElementById("paneCreate");
const paneJoin = document.getElementById("paneJoin");

function showCreate() {
  tabCreate.classList.add("active");
  tabJoin.classList.remove("active");
  paneCreate.classList.remove("hidden");
  paneJoin.classList.add("hidden");
}
function showJoin() {
  tabJoin.classList.add("active");
  tabCreate.classList.remove("active");
  paneJoin.classList.remove("hidden");
  paneCreate.classList.add("hidden");
}
tabCreate.addEventListener("click", showCreate);
tabJoin.addEventListener("click", showJoin);

// URLに ?room=XXXX があれば「参加」タブを開いて自動入力（Discordで共有されたリンク用）
const params = new URLSearchParams(location.search);
const sharedRoom = params.get("room");
if (sharedRoom) {
  showJoin();
  document.getElementById("joinRoomId").value = sharedRoom.toUpperCase();
}

function ensureSignedIn() {
  return new Promise((resolve, reject) => {
    if (auth.currentUser) return resolve(auth.currentUser);
    auth.signInAnonymously().catch(reject);
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) { unsub(); resolve(user); }
    });
  });
}

// ---- 部屋を作成 ----
document.getElementById("btnCreate").addEventListener("click", async () => {
  const errEl = document.getElementById("createError");
  errEl.textContent = "";
  const name = document.getElementById("createName").value.trim();
  if (!name) { errEl.textContent = "名前を入力してください"; return; }

  const btn = document.getElementById("btnCreate");
  btn.disabled = true;
  btn.textContent = "作成中...";

  try {
    const user = await ensureSignedIn();
    let roomId = genRoomId();

    // 万一の衝突を回避
    for (let i = 0; i < 5; i++) {
      const existing = await db.collection("rooms").doc(roomId).get();
      if (!existing.exists) break;
      roomId = genRoomId();
    }

    await db.collection("rooms").doc(roomId).set({
      hostUid: user.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: "waiting",
      turnOrder: [user.uid],
      currentTurnIndex: 0,
      propertyOwners: {},
      players: {
        [user.uid]: {
          name,
          money: START_MONEY,
          position: 0,
          isGM: true,
          color: pickColor(0),
          joinedAt: Date.now(),
        },
      },
      log: [{ ts: Date.now(), text: `${name} が部屋を作成しました（GM）` }],
    });

    location.href = `room.html?room=${roomId}`;
  } catch (e) {
    console.error(e);
    errEl.textContent = "作成に失敗しました: " + e.message;
    btn.disabled = false;
    btn.textContent = "部屋を作成する";
  }
});

// ---- 部屋に参加 ----
document.getElementById("btnJoin").addEventListener("click", async () => {
  const errEl = document.getElementById("joinError");
  errEl.textContent = "";
  const roomId = document.getElementById("joinRoomId").value.trim().toUpperCase();
  const name = document.getElementById("joinName").value.trim();
  if (!roomId) { errEl.textContent = "部屋コードを入力してください"; return; }
  if (!name) { errEl.textContent = "名前を入力してください"; return; }

  const btn = document.getElementById("btnJoin");
  btn.disabled = true;
  btn.textContent = "入室中...";

  try {
    const user = await ensureSignedIn();
    const roomRef = db.collection("rooms").doc(roomId);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists) throw new Error("部屋が見つかりません。コードを確認してください。");
      const data = snap.data();

      if (data.players[user.uid]) {
        // 既に参加済み（再開）。名前だけ更新しておく
        tx.update(roomRef, { [`players.${user.uid}.name`]: name });
        return;
      }

      const playerCount = Object.keys(data.players).length;
      const newTurnOrder = [...data.turnOrder, user.uid];
      tx.update(roomRef, {
        [`players.${user.uid}`]: {
          name,
          money: START_MONEY,
          position: 0,
          isGM: false,
          color: pickColor(playerCount),
          joinedAt: Date.now(),
        },
        turnOrder: newTurnOrder,
        log: firebase.firestore.FieldValue.arrayUnion({ ts: Date.now(), text: `${name} が入室しました` }),
      });
    });

    location.href = `room.html?room=${roomId}`;
  } catch (e) {
    console.error(e);
    errEl.textContent = e.message || "参加に失敗しました";
    btn.disabled = false;
    btn.textContent = "部屋に入る";
  }
});

function pickColor(index) {
  const palette = ["#e07a5f", "#3d9a8b", "#f2b134", "#5b7fd6", "#a45de2", "#e0518f", "#7fb069", "#c1503f"];
  return palette[index % palette.length];
}
