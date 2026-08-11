// board-data.js — モノポリー（英語版和訳準拠）完全盤面＆カードデータ

/**
 * 盤面全40マスの定義
 * - type: 
 *   - 'go': GOマス
 *   - 'property': 土地（カラーグループ）
 *   - 'railroad': 鉄道会社
 *   - 'utility': 公共事業会社（電力・水道）
 *   - 'tax': 税金（所得税・物品税）
 *   - 'chance': チャンス
 *   - 'community': 共同基金
 *   - 'jail': 刑務所（見学 / 入所）
 *   - 'go_to_jail': 刑務所へ行け
 *   - 'parking': 無料駐車場
 */
const BOARD_SPACES = [
  // 0: GO
  { id: 0, name: "GO（スタート）", type: "go" },

  // 1-9: 茶色 & 鉄道 & 水色グループ
  { id: 1, name: "メディタレニアン通り", type: "property", group: "brown", price: 60, rent: [2, 10, 30, 90, 160, 250], housePrice: 50 },
  { id: 2, name: "共同基金", type: "community" },
  { id: 3, name: "バルティック通り", type: "property", group: "brown", price: 60, rent: [4, 20, 60, 180, 320, 450], housePrice: 50 },
  { id: 4, name: "所得税", type: "tax", amount: 200 },
  { id: 5, name: "リーディング鉄道", type: "railroad", price: 200, rent: [25, 50, 100, 200] },
  { id: 6, name: "オリエンタル通り", type: "property", group: "light_blue", price: 100, rent: [6, 30, 90, 270, 400, 550], housePrice: 50 },
  { id: 7, name: "チャンス", type: "chance" },
  { id: 8, name: "バーモント通り", type: "property", group: "light_blue", price: 100, rent: [6, 30, 90, 270, 400, 550], housePrice: 50 },
  { id: 9, name: "コネチカット通り", type: "property", group: "light_blue", price: 120, rent: [8, 40, 100, 300, 450, 600], housePrice: 50 },

  // 10-19: 刑務所 & ライトピンク & オレンジグループ
  { id: 10, name: "刑務所（刑務所見学）", type: "jail" },
  { id: 11, name: "セントチャールズプレイス", type: "property", group: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], housePrice: 100 },
  { id: 12, name: "電力会社", type: "utility", price: 150 },
  { id: 13, name: "ステーツ通り", type: "property", group: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], housePrice: 100 },
  { id: 14, name: "バージニア通り", type: "property", group: "pink", price: 160, rent: [12, 60, 180, 500, 700, 900], housePrice: 100 },
  { id: 15, name: "ペンシルバニア鉄道", type: "railroad", price: 200, rent: [25, 50, 100, 200] },
  { id: 16, name: "セントジェームスプレイス", type: "property", group: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], housePrice: 100 },
  { id: 17, name: "共同基金", type: "community" },
  { id: 18, name: "テネシー通り", type: "property", group: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], housePrice: 100 },
  { id: 19, name: "ニューヨーク通り", type: "property", group: "orange", price: 200, rent: [16, 80, 220, 600, 800, 1000], housePrice: 100 },

  // 20-29: フリーパーキング & 赤 & 黄色グループ
  { id: 20, name: "無料駐車場", type: "parking" },
  { id: 21, name: "ケンタッキー通り", type: "property", group: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050], housePrice: 150 },
  { id: 22, name: "チャンス", type: "chance" },
  { id: 23, name: "インディアナ通り", type: "property", group: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050], housePrice: 150 },
  { id: 24, name: "イリノイ通り", type: "property", group: "red", price: 240, rent: [20, 100, 300, 750, 925, 1100], housePrice: 150 },
  { id: 25, name: "B&O 鉄道", type: "railroad", price: 200, rent: [25, 50, 100, 200] },
  { id: 26, name: "アトランティック通り", type: "property", group: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150], housePrice: 150 },
  { id: 27, name: "ベントナー通り", type: "property", group: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150], housePrice: 150 },
  { id: 28, name: "水道会社", type: "utility", price: 150 },
  { id: 29, name: "マービンガーデン", type: "property", group: "yellow", price: 280, rent: [24, 120, 360, 850, 1025, 1200], housePrice: 150 },

  // 30-39: 刑務所へ行け & 緑 & ダークブルーグループ
  { id: 30, name: "刑務所へ行け", type: "go_to_jail" },
  { id: 31, name: "パシフィック通り", type: "property", group: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275], housePrice: 200 },
  { id: 32, name: "ノースキャロライナ通り", type: "property", group: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275], housePrice: 200 },
  { id: 33, name: "共同基金", type: "community" },
  { id: 34, name: "ペンシルバニア通り", type: "property", group: "green", price: 320, rent: [28, 150, 450, 1000, 1200, 1400], housePrice: 200 },
  { id: 35, name: "ショートライン鉄道", type: "railroad", price: 200, rent: [25, 50, 100, 200] },
  { id: 36, name: "チャンス", type: "chance" },
  { id: 37, name: "パークプレイス", type: "property", group: "dark_blue", price: 350, rent: [35, 175, 500, 1100, 1300, 1500], housePrice: 200 },
  { id: 38, name: "物品税", type: "tax", amount: 100 },
  { id: 39, name: "ボードウォーク", type: "property", group: "dark_blue", price: 400, rent: [50, 200, 600, 1400, 1700, 2000], housePrice: 200 }
];

/**
 * チャンスカード（16枚）
 */
const CHANCE_CARDS = [
  { id: "c1", text: "GO（スタート）へ進む（$200受取）", action: "move_to", target: 0, collectGo: true },
  { id: "c2", text: "イリノイ通りへ進む。GOを通ったら$200を受け取る", action: "move_to", target: 24, collectGo: true },
  { id: "c3", text: "セントチャールズプレイスへ進む。GOを通ったら$200を受け取る", action: "move_to", target: 11, collectGo: true },
  { id: "c4", text: "最寄りの公共事業会社へ進む（未所有なら購入可、所有済ならダイスの目の10倍を支払う）", action: "nearest_utility" },
  { id: "c5", text: "最寄りの鉄道会社へ進む（所有者に2倍の家賃を支払う、未所有なら購入可）", action: "nearest_railroad" },
  { id: "c6", text: "銀行より$50の利息が付与される", action: "money", amount: 50 },
  { id: "c7", text: "釈放許可証（刑務所から無料で出られる）", action: "jail_free_card" },
  { id: "c8", text: "3マス戻る", action: "move_back", steps: 3 },
  { id: "c9", text: "刑務所へ行く（GOは通らない）", action: "go_to_jail" },
  { id: "c10", text: "各物件の修理費を支払う（家1軒につき$25、ホテル1軒につき$100）", action: "repairs", house: 25, hotel: 100 },
  { id: "c11", text: "スピード違反の罰金$15を支払う", action: "money", amount: -15 },
  { id: "c12", text: "ボードウォークへ進む", action: "move_to", target: 39, collectGo: false },
  { id: "c13", text: "ビルボード取締役会長に選出された。各プレイヤーに$50を支払う", action: "pay_players", amount: 50 },
  { id: "c14", text: "ビルローンが満期を迎えた。$150を受け取る", action: "money", amount: 150 },
  { id: "c15", text: "リーディング鉄道へ進む。GOを通ったら$200を受け取る", action: "move_to", target: 5, collectGo: true },
  { id: "c16", text: "クロスワードコンテストで優勝した。$100を受け取る", action: "money", amount: 100 }
];

/**
 * 共同基金カード（16枚）
 */
const COMMUNITY_CARDS = [
  { id: "cm1", text: "GO（スタート）へ進む（$200受取）", action: "move_to", target: 0, collectGo: true },
  { id: "cm2", text: "銀行の計算違い。$200を受け取る", action: "money", amount: 200 },
  { id: "cm3", text: "医師の謝礼金$50を支払う", action: "money", amount: -50 },
  { id: "cm4", text: "株式売却により$50を受け取る", action: "money", amount: 50 },
  { id: "cm5", text: "釈放許可証（刑務所から無料で出られる）", action: "jail_free_card" },
  { id: "cm6", text: "刑務所へ行く（GOは通らない）", action: "go_to_jail" },
  { id: "cm7", text: "オペラの開演式。各プレイヤーから$50を受け取る", action: "collect_from_players", amount: 50 },
  { id: "cm8", text: "クリスマス基金の積立金が満期になった。$100を受け取る", action: "money", amount: 100 },
  { id: "cm9", text: "所得税の過払い還付金$20を受け取る", action: "money", amount: 20 },
  { id: "cm10", text: "誕生日祝い。各プレイヤーから$10を受け取る", action: "collect_from_players", amount: 10 },
  { id: "cm11", text: "生命保険金$100を受け取る", action: "money", amount: 100 },
  { id: "cm12", text: "入院費$100を支払う", action: "money", amount: -100 },
  { id: "cm13", text: "学校の授業料$50を支払う", action: "money", amount: -50 },
  { id: "cm14", text: "コンサルタント料$25を受け取る", action: "money", amount: 25 },
  { id: "cm15", text: "街の道路工事費を請求される（家1軒につき$40、ホテル1軒につき$115）", action: "repairs", house: 40, hotel: 115 },
  { id: "cm16", text: "コンテストで2等賞になった。$10を受け取る", action: "money", amount: 10 }
];

// 他のJSファイル（game.jsなど）から参照できるようにグローバル展開
if (typeof window !== "undefined") {
  window.BOARD_SPACES = BOARD_SPACES;
  window.CHANCE_CARDS = CHANCE_CARDS;
  window.COMMUNITY_CARDS = COMMUNITY_CARDS;
}
