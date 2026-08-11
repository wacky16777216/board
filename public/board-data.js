// board-data.js
// 盤面の定義。index 0 が GO（スタート）で、時計回りに進みます。
// type: 'go' | 'property' | 'tax' | 'chance' | 'parking'

const BOARD = [
  { name: "GO",           type: "go" },
  { name: "表参道",        type: "property", price: 60,  rent: 10, group: "a" },
  { name: "チャンス",      type: "chance" },
  { name: "新宿",          type: "property", price: 80,  rent: 14, group: "a" },
  { name: "所得税",        type: "tax", amount: 100 },
  { name: "渋谷",          type: "property", price: 100, rent: 18, group: "b" },
  { name: "中央駅",        type: "property", price: 120, rent: 20, group: "b" },
  { name: "六本木",        type: "property", price: 140, rent: 24, group: "b" },
  { name: "チャンス",      type: "chance" },
  { name: "銀座",          type: "property", price: 160, rent: 28, group: "c" },
  { name: "無料駐車場",    type: "parking" },
  { name: "秋葉原",        type: "property", price: 140, rent: 24, group: "c" },
  { name: "上野",          type: "property", price: 100, rent: 18, group: "c" },
  { name: "チャンス",      type: "chance" },
  { name: "浅草",          type: "property", price: 120, rent: 20, group: "d" },
  { name: "品川",          type: "property", price: 160, rent: 28, group: "d" },
  { name: "横浜",          type: "property", price: 180, rent: 32, group: "d" },
  { name: "チャンス",      type: "chance" },
  { name: "固定資産税",    type: "tax", amount: 75 },
  { name: "お台場",        type: "property", price: 200, rent: 36, group: "e" },
];

// グループごとの色（マス表示用）
const GROUP_COLORS = {
  a: "#e07a5f",
  b: "#3d9a8b",
  c: "#f2b134",
  d: "#5b7fd6",
  e: "#a45de2",
};

// チャンスカード。money はその場で加減算、move は指定マス数だけ進む（負数で戻る）
const CHANCE_CARDS = [
  { text: "臨時収入！ +50", type: "money", value: 50 },
  { text: "罰金を支払う -30", type: "money", value: -30 },
  { text: "宝くじが当たった！ +100", type: "money", value: 100 },
  { text: "修繕費がかかった -60", type: "money", value: -60 },
  { text: "3マス進む", type: "move", value: 3 },
  { text: "2マス戻る", type: "move", value: -2 },
  { text: "GOに戻る（+200受け取り）", type: "goto_go" },
];

if (typeof module !== "undefined") {
  module.exports = { BOARD, GROUP_COLORS, CHANCE_CARDS };
}
