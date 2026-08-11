// game.js
const params = new URLSearchParams(location.search);
const roomId = (params.get("room") || "").toUpperCase();
const roomRef = db.collection("rooms").doc(roomId);

let myUid = null;
let latestData = null;
let boardTilesBuilt = false;

document.getElementById("roomIdLabel").textContent = roomId || "----";

if (!roomId) {
  alert("部屋コードが見つかりません。トップページからやり直してください。");
  location.href = "index.html";
}

// ---------- 認証 & 参加確認 ----------
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    await auth.signInAnonymously().catch((e) => console.error(e));
    return;
  }
  myUid = user.uid;

  const snap = await roomRef.get();
  if (!snap.exists) {
    alert("部屋が見つかりません。");
    location.href = "index.html";
    return;
  }
  const data = snap.data();
  if (!data.players[myUid]) {
    // まだ参加していない → 名前入力へ
    location.href = `index.html?room=${roomId}`;
    return;
  }

  buildBoardSkeleton();
  roomRef.onSnapshot(onRoomUpdate, (err) => console.error(err));
});

// ---------- 盤面の枠を一度だけ作る ----------
// 6x6グリッドの外周20マスに BOARD の各タイルを割り当てる
function tileGridPosition(i) {
  // 下段: 右→左 (0-5), 左列: 下→上 (6-10), 上段: 左→右 (11-15), 右列: 上→下 (16-19)
  if (i <= 5) return { row: 6, col: 6 - i };
  if (i <= 10) return { row: 6 - (i - 5), col: 1 };
  if (i <= 15) return { row: 1, col: 1 + (i - 10) };
  return { row: 1 + (i - 15), col: 6 };
}

function buildBoardSkeleton() {
  if (boardTilesBuilt) return;
  boardTilesBuilt = true;
  const boardEl = document.getElementById("board");
  boardEl.innerHTML = "";

  BOARD.forEach((tile, i) => {
    const pos = tileGridPosition(i);
    const el = document.createElement("div");
    el.className = `tile ${tile.type}`;
    el.style.gridRow = pos.row;
    el.style.gridColumn = pos.col;
    el.dataset.tileIndex = i;

    let inner = "";
    if (tile.group) {
      inner += `<div class="group-bar" style="background:${GROUP_COLORS[tile.group]}"></div>`;
    }
    inner += `<div class="tile-name">${tile.name}</div>`;
    if (tile.type === "property") inner += `<div class="tile-sub">$${tile.price}</div>`;
    if (tile.type === "tax") inner += `<div class="tile-sub">-$${tile.amount}</div>`;
    inner += `<div class="pawns" data-pawns="${i}"></div>`;
    el.innerHTML = inner;
    boardEl.appendChild(el);
  });

  // 中央パネル
  const center = document.createElement("div");
  center.className = "tile center-info";
  center.innerHTML = `
    <div class="center-panel">
      <div>
        <div class="turn-label">現在のターン</div>
        <div class="turn-name" id="turnName">-</div>
      </div>
      <div class="dice-display" id="diceDisplay">
        <div class="die">-</div>
        <div class="die">-</div>
      </div>
      <div class="mono" style="font-size:.75rem; opacity:.6;" id="roomCodeCenter"></div>
    </div>
  `;
  boardEl.appendChild(center);
  document.getElementById("roomCodeCenter").textContent = `#${roomId}`;
}

// ---------- Firestoreの更新を受けて描画 ----------
function onRoomUpdate(snap) {
  if (!snap.exists) return;
  const data = snap.data();
  latestData = data;
  renderPlayers(data);
  renderPawns(data);
  renderOwners(data);
  renderLog(data);
  renderTurn(data);
  renderGM(data);
  renderBuyPrompt(data);
  renderDice(data);
  populateSelects(data);
}

function renderPlayers(data) {
  const list = document.getElementById("playerList");
  list.innerHTML = "";
  const currentUid = data.turnOrder[data.currentTurnIndex];
  data.turnOrder.forEach((uid) => {
    const p = data.players[uid];
    if (!p) return;
    const row = document.createElement("div");
    row.className = "player-row" + (uid === currentUid ? " current" : "");
    row.innerHTML = `
      <div class="dot" style="background:${p.color}"></div>
      <div class="pname">${escapeHtml(p.name)}${uid === myUid ? " (あなた)" : ""}</div>
      ${p.isGM ? '<span class="gm-badge">GM</span>' : ""}
      <div class="pmoney">$${p.money}</div>
    `;
    list.appendChild(row);
  });
}

function renderPawns(data) {
  document.querySelectorAll("[data-pawns]").forEach((el) => (el.innerHTML = ""));
  data.turnOrder.forEach((uid) => {
    const p = data.players[uid];
    if (!p) return;
    const container = document.querySelector(`[data-pawns="${p.position}"]`);
    if (!container) return;
    const pawn = document.createElement("div");
    pawn.className = "pawn";
    pawn.style.background = p.color;
    pawn.title = p.name;
    pawn.textContent = p.name.slice(0, 1);
    container.appendChild(pawn);
  });
}

function renderOwners(data) {
  document.querySelectorAll(".tile.property").forEach((el) => {
    const idx = el.dataset.tileIndex;
    const existing = el.querySelector(".owner-dot");
    if (existing) existing.remove();
    const ownerUid = data.propertyOwners && data.propertyOwners[idx];
    if (ownerUid && data.players[ownerUid]) {
      const dot = document.createElement("div");
      dot.className = "owner-dot";
      dot.style.background = data.players[ownerUid].color;
      dot.title = `所有者: ${data.players[ownerUid].name}`;
      el.appendChild(dot);
    }
  });
}

function renderLog(data) {
  const list = document.getElementById("logList");
  const entries = (data.log || []).slice(-60).reverse();
  list.innerHTML = entries
    .map((e) => {
      const t = new Date(e.ts);
      const hh = String(t.getHours()).padStart(2, "0");
      const mm = String(t.getMinutes()).padStart(2, "0");
      return `<div class="log-entry"><span class="ts">${hh}:${mm}</span>${escapeHtml(e.text)}</div>`;
    })
    .join("");
}

function renderTurn(data) {
  const currentUid = data.turnOrder[data.currentTurnIndex];
  const p = data.players[currentUid];
  const turnNameEl = document.getElementById("turnName");
  if (turnNameEl) turnNameEl.textContent = p ? p.name : "-";

  const isMyTurn = currentUid === myUid;
  const hasPendingBuy = !!data.pendingBuy;
  document.getElementById("btnRoll").disabled = !isMyTurn || hasPendingBuy;
  document.getElementById("turnHint").textContent = hasPendingBuy
    ? "購入判断待ちです"
    : isMyTurn
    ? "あなたの番です！"
    : `${p ? p.name : "?"} の番を待っています…`;
}

function renderDice(data) {
  if (!data.lastRoll) return;
  const dice = document.querySelectorAll("#diceDisplay .die");
  if (dice.length === 2) {
    dice[0].textContent = data.lastRoll.d1;
    dice[1].textContent = data.lastRoll.d2;
  }
}

function renderBuyPrompt(data) {
  const box = document.getElementById("buyPrompt");
  const rollArea = document.getElementById("rollArea");
  if (data.pendingBuy && data.pendingBuy.uid === myUid) {
    const tile = BOARD[data.pendingBuy.tileIndex];
    document.getElementById("buyPrice").textContent = `$${tile.price}`;
    box.classList.remove("hidden");
    rollArea.classList.add("hidden");
  } else {
    box.classList.add("hidden");
    rollArea.classList.remove("hidden");
  }
}

function renderGM(data) {
  const me = data.players[myUid];
  document.getElementById("gmPanel").classList.toggle("hidden", !(me && me.isGM));
}

function populateSelects(data) {
  const others = data.turnOrder.filter((uid) => uid !== myUid && data.players[uid]);
  fillSelect("tradeTarget", others, data);
  fillSelect("gmTarget", data.turnOrder.filter((uid) => data.players[uid]), data);

  // 自分が所有する土地を交渉候補に
  const propSel = document.getElementById("tradeProperty");
  const myProps = Object.entries(data.propertyOwners || {}).filter(([, uid]) => uid === myUid);
  const keep = propSel.querySelector('option[value=""]');
  propSel.innerHTML = "";
  propSel.appendChild(keep || new Option("なし", ""));
  myProps.forEach(([idx]) => {
    propSel.appendChild(new Option(BOARD[idx].name, idx));
  });
}

function fillSelect(id, uids, data) {
  const sel = document.getElementById(id);
  const prevVal = sel.value;
  sel.innerHTML = "";
  uids.forEach((uid) => {
    const opt = new Option(data.players[uid].name, uid);
    sel.appendChild(opt);
  });
  if (uids.includes(prevVal)) sel.value = prevVal;
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

// ---------- サイコロを振る ----------
document.getElementById("btnRoll").addEventListener("click", async () => {
  const btn = document.getElementById("btnRoll");
  btn.disabled = true;
  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(roomRef);
      const data = snap.data();
      if (data.pendingBuy) throw new Error("購入判断待ちです");
      const currentUid = data.turnOrder[data.currentTurnIndex];
      if (currentUid !== myUid) throw new Error("あなたの番ではありません");

      const d1 = 1 + Math.floor(Math.random() * 6);
      const d2 = 1 + Math.floor(Math.random() * 6);
      const steps = d1 + d2;
      const player = data.players[myUid];
      const rawPos = player.position + steps;
      const passedGo = rawPos >= BOARD.length;
      let newPos = rawPos % BOARD.length;
      let newMoney = player.money + (passedGo ? 200 : 0);

      const logs = [{ ts: Date.now(), text: `${player.name} がサイコロを振った（${d1}+${d2}=${steps}）` }];
      if (passedGo) logs.push({ ts: Date.now(), text: `${player.name} がGOを通過し +200 受け取った` });

      const updates = {};
      let pendingBuy = null;
      let advanceTurn = true;
      const propertyOwners = data.propertyOwners || {};

      let tile = BOARD[newPos];
      logs.push({ ts: Date.now(), text: `${player.name} は「${tile.name}」に止まった` });

      if (tile.type === "property") {
        const ownerUid = propertyOwners[newPos];
        if (!ownerUid) {
          if (newMoney >= tile.price) {
            pendingBuy = { uid: myUid, tileIndex: newPos };
            advanceTurn = false;
          } else {
            logs.push({ ts: Date.now(), text: `${player.name} は所持金不足で購入できない` });
          }
        } else if (ownerUid !== myUid) {
          const rent = tile.rent;
          newMoney -= rent;
          const ownerData = data.players[ownerUid];
          updates[`players.${ownerUid}.money`] = ownerData.money + rent;
          logs.push({ ts: Date.now(), text: `${player.name} が ${ownerData.name} に家賃 $${rent} を支払った` });
        }
      } else if (tile.type === "tax") {
        newMoney -= tile.amount;
        logs.push({ ts: Date.now(), text: `${player.name} が税金 $${tile.amount} を支払った` });
      } else if (tile.type === "chance") {
        const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
        logs.push({ ts: Date.now(), text: `${player.name} がチャンスカード「${card.text}」を引いた` });
        if (card.type === "money") newMoney += card.value;
        else if (card.type === "move") newPos = (newPos + card.value + BOARD.length) % BOARD.length;
        else if (card.type === "goto_go") {
          newPos = 0;
          newMoney += 200;
        }
      }

      updates[`players.${myUid}.position`] = newPos;
      updates[`players.${myUid}.money`] = newMoney;
      updates.lastRoll = { uid: myUid, d1, d2, ts: Date.now() };
      updates.pendingBuy = pendingBuy;
      updates.status = "playing";
      if (advanceTurn) {
        updates.currentTurnIndex = (data.currentTurnIndex + 1) % data.turnOrder.length;
      }
      updates.log = firebase.firestore.FieldValue.arrayUnion(...logs);

      tx.update(roomRef, updates);
    });
  } catch (e) {
    console.error(e);
    alert(e.message);
    btn.disabled = false;
  }
});

// ---------- 購入する / しない ----------
document.getElementById("btnBuy").addEventListener("click", async () => {
  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(roomRef);
      const data = snap.data();
      if (!data.pendingBuy || data.pendingBuy.uid !== myUid) return;
      const idx = data.pendingBuy.tileIndex;
      const tile = BOARD[idx];
      const player = data.players[myUid];
      if (player.money < tile.price) throw new Error("所持金が足りません");

      tx.update(roomRef, {
        [`players.${myUid}.money`]: player.money - tile.price,
        [`propertyOwners.${idx}`]: myUid,
        pendingBuy: null,
        currentTurnIndex: (data.currentTurnIndex + 1) % data.turnOrder.length,
        log: firebase.firestore.FieldValue.arrayUnion({
          ts: Date.now(),
          text: `${player.name} が「${tile.name}」を $${tile.price} で購入した`,
        }),
      });
    });
  } catch (e) {
    alert(e.message);
  }
});

document.getElementById("btnSkipBuy").addEventListener("click", async () => {
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(roomRef);
    const data = snap.data();
    if (!data.pendingBuy || data.pendingBuy.uid !== myUid) return;
    const tile = BOARD[data.pendingBuy.tileIndex];
    const player = data.players[myUid];
    tx.update(roomRef, {
      pendingBuy: null,
      currentTurnIndex: (data.currentTurnIndex + 1) % data.turnOrder.length,
      log: firebase.firestore.FieldValue.arrayUnion({
        ts: Date.now(),
        text: `${player.name} は「${tile.name}」の購入を見送った`,
      }),
    });
  });
});

// ---------- 交渉 ----------
const tradeModal = document.getElementById("tradeModal");
document.getElementById("btnTrade").addEventListener("click", () => {
  document.getElementById("tradeError").textContent = "";
  tradeModal.classList.remove("hidden");
});
document.getElementById("btnTradeCancel").addEventListener("click", () => {
  tradeModal.classList.add("hidden");
});
document.getElementById("btnTradeConfirm").addEventListener("click", async () => {
  const errEl = document.getElementById("tradeError");
  errEl.textContent = "";
  const targetUid = document.getElementById("tradeTarget").value;
  const amount = parseInt(document.getElementById("tradeMoney").value || "0", 10);
  const propIdx = document.getElementById("tradeProperty").value;

  if (!targetUid) { errEl.textContent = "相手を選んでください"; return; }
  if (amount < 0) { errEl.textContent = "金額が不正です"; return; }

  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(roomRef);
      const data = snap.data();
      const me = data.players[myUid];
      const target = data.players[targetUid];
      if (amount > me.money) throw new Error("所持金が足りません");
      if (propIdx !== "" && data.propertyOwners[propIdx] !== myUid) {
        throw new Error("その土地はあなたの所有ではありません");
      }

      const updates = {
        [`players.${myUid}.money`]: me.money - amount,
        [`players.${targetUid}.money`]: target.money + amount,
      };
      let logText = `${me.name} が ${target.name} に $${amount} を渡した`;
      if (propIdx !== "") {
        updates[`propertyOwners.${propIdx}`] = targetUid;
        logText += `／「${BOARD[propIdx].name}」を譲渡した`;
      }
      updates.log = firebase.firestore.FieldValue.arrayUnion({ ts: Date.now(), text: logText });
      tx.update(roomRef, updates);
    });
    tradeModal.classList.add("hidden");
    document.getElementById("tradeMoney").value = "";
  } catch (e) {
    errEl.textContent = e.message;
  }
});

// ---------- GMコマンド ----------
document.getElementById("btnGmApply").addEventListener("click", async () => {
  const targetUid = document.getElementById("gmTarget").value;
  const moneyVal = document.getElementById("gmMoney").value;
  const posVal = document.getElementById("gmPosition").value;
  if (!targetUid) return;

  const updates = {};
  const logs = [];
  if (moneyVal !== "") {
    updates[`players.${targetUid}.money`] = parseInt(moneyVal, 10);
    logs.push(`所持金を $${moneyVal} に変更`);
  }
  if (posVal !== "") {
    const p = Math.max(0, Math.min(19, parseInt(posVal, 10)));
    updates[`players.${targetUid}.position`] = p;
    logs.push(`位置を「${BOARD[p].name}」に変更`);
  }
  if (Object.keys(updates).length === 0) return;

  const targetName = latestData.players[targetUid].name;
  updates.log = firebase.firestore.FieldValue.arrayUnion({
    ts: Date.now(),
    text: `[GM操作] ${targetName}: ${logs.join(" / ")}`,
  });
  await roomRef.update(updates);
  document.getElementById("gmMoney").value = "";
  document.getElementById("gmPosition").value = "";
});

document.getElementById("btnGmMakeGM").addEventListener("click", async () => {
  const targetUid = document.getElementById("gmTarget").value;
  if (!targetUid) return;
  const targetName = latestData.players[targetUid].name;
  await roomRef.update({
    [`players.${targetUid}.isGM`]: true,
    log: firebase.firestore.FieldValue.arrayUnion({
      ts: Date.now(),
      text: `[GM操作] ${targetName} をGMに任命した`,
    }),
  });
});

// ---------- 共有リンクコピー ----------
document.getElementById("btnCopyLink").addEventListener("click", async () => {
  const url = `${location.origin}${location.pathname.replace("room.html", "index.html")}?room=${roomId}`;
  try {
    await navigator.clipboard.writeText(url);
    const btn = document.getElementById("btnCopyLink");
    const original = btn.textContent;
    btn.textContent = "コピーしました！";
    setTimeout(() => (btn.textContent = original), 1500);
  } catch {
    prompt("このURLをコピーしてDiscordに貼ってください:", url);
  }
});
