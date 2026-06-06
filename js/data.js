// =============================================================
// 寿司ネタマスターデータ
// =============================================================
// 各ネタ:
//   id      : ユニークID
//   name    : 表示名
//   emoji   : 表示用絵文字（軽量・無料運用のため画像不要）
//   color   : 仕分け対応色 (red / white / orange / green / special)
//   rarity  : N / R / SR / SSR
//   desc    : 図鑑用の一言コメント
// =============================================================

const SUSHI_DATA = [
  // ---- N (ノーマル) : 出やすい ----
  { id: 'tamago',    name: 'たまご',     emoji: '🟨', color: 'green',  rarity: 'N',   desc: '甘くてやさしい味。子供の定番。' },
  { id: 'kappa',     name: 'かっぱ巻き', emoji: '🥒', color: 'green',  rarity: 'N',   desc: 'きゅうりの細巻き。さっぱり。' },
  { id: 'inari',     name: 'いなり',     emoji: '🟫', color: 'green',  rarity: 'N',   desc: '甘い油揚げに酢飯。' },
  { id: 'maguro',    name: 'まぐろ',     emoji: '🔴', color: 'red',    rarity: 'N',   desc: '王道の赤身。間違いなし。' },
  { id: 'salmon',    name: 'サーモン',   emoji: '🟠', color: 'orange', rarity: 'N',   desc: '不動の人気者。とろける脂。' },
  { id: 'ika',       name: 'いか',       emoji: '⚪', color: 'white',  rarity: 'N',   desc: 'コリッとした食感が魅力。' },

  // ---- R (レア) ----
  { id: 'ebi',       name: 'えび',       emoji: '🦐', color: 'orange', rarity: 'R',   desc: 'ぷりぷり食感。茹でて甘く。' },
  { id: 'hamachi',   name: 'はまち',     emoji: '🟡', color: 'white',  rarity: 'R',   desc: '脂のりが上品なブリの若魚。' },
  { id: 'tai',       name: 'たい',       emoji: '🐟', color: 'white',  rarity: 'R',   desc: 'おめでたい白身の代表。' },
  { id: 'ikura',     name: 'いくら',     emoji: '🟧', color: 'orange', rarity: 'R',   desc: 'プチプチはじける醤油の海。' },
  { id: 'tekka',     name: '鉄火巻き',   emoji: '🍣', color: 'red',    rarity: 'R',   desc: 'まぐろの細巻き。粋。' },

  // ---- SR (スーパーレア) ----
  { id: 'chu_toro',  name: '中とろ',     emoji: '🟥', color: 'red',    rarity: 'SR',  desc: '赤身ととろの中間。バランス◎' },
  { id: 'uni',       name: 'うに',       emoji: '🟧', color: 'orange', rarity: 'SR',  desc: '海のクリーム。濃厚な甘さ。' },
  { id: 'anago',     name: 'あなご',     emoji: '🟫', color: 'white',  rarity: 'SR',  desc: 'ふわっと甘いツメが香る。' },
  { id: 'hotate',    name: 'ほたて',     emoji: '⚪', color: 'white',  rarity: 'SR',  desc: '貝の王様。とろける甘み。' },

  // ---- SSR (超レア) ----
  { id: 'o_toro',    name: '大とろ',     emoji: '💎', color: 'red',    rarity: 'SSR', desc: '寿司の頂点。口でとろける。' },
  { id: 'kohada',    name: 'こはだ',     emoji: '🌟', color: 'special', rarity: 'SSR', desc: '江戸前の粋。職人技が光る。' },
  { id: 'awabi',     name: 'あわび',     emoji: '👑', color: 'special', rarity: 'SSR', desc: '高級貝の中の高級貝。' },
];

// レアリティ別のガチャ確率（合計 100）
const GACHA_RATES = {
  N:   60,
  R:   28,
  SR:  10,
  SSR: 2,
};

// レアリティ別の色（表示用）
const RARITY_COLORS = {
  N:   '#9ca3af',
  R:   '#3b82f6',
  SR:  '#a855f7',
  SSR: '#f59e0b',
};

// 仕分け皿の色（明るく和風な色合い）
const PLATE_COLORS = {
  red:    { bg: '#fee2e2', border: '#dc2626', label: '赤'   },
  white:  { bg: '#f9fafb', border: '#9ca3af', label: '白'   },
  orange: { bg: '#ffedd5', border: '#ea580c', label: '橙'   },
  green:  { bg: '#dcfce7', border: '#16a34a', label: '緑'   },
};

// ゲーム設定
const GAME_CONFIG = {
  ROUND_DURATION: 30,      // 1ラウンドの秒数
  SPAWN_INTERVAL: 900,     // 寿司が流れてくる間隔(ms)
  BELT_DURATION: 5000,     // 流れる時間(ms) - これを超えるとミス
  COMBO_BONUS: 5,          // コンボごとの追加スコア
  COIN_PER_SCORE: 0.5,     // スコア→コイン換算率
  GACHA_COST: 100,         // 1回ガチャのコスト
};

// 確率に従ってネタを1個抽選
function rollGacha() {
  const roll = Math.random() * 100;
  let rarity;
  if (roll < GACHA_RATES.SSR) rarity = 'SSR';
  else if (roll < GACHA_RATES.SSR + GACHA_RATES.SR) rarity = 'SR';
  else if (roll < GACHA_RATES.SSR + GACHA_RATES.SR + GACHA_RATES.R) rarity = 'R';
  else rarity = 'N';

  const pool = SUSHI_DATA.filter(s => s.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

// ゲーム本体で流す寿司の抽選（ノーマル中心、たまにレア）
function rollGameSushi() {
  // ゲーム中は基本N、5%でR、1%でSRも紛れる
  const roll = Math.random() * 100;
  let rarity;
  if (roll < 1) rarity = 'SR';
  else if (roll < 6) rarity = 'R';
  else rarity = 'N';

  // special カラーはゲーム中には流さない（ガチャ専用の演出ネタ）
  const pool = SUSHI_DATA.filter(s => s.rarity === rarity && s.color !== 'special');
  return pool[Math.floor(Math.random() * pool.length)];
}
