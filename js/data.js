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
  // 仕分け色のテーマ:
  //   red    = 赤身魚（まぐろ系）
  //   white  = 白身魚・イカ・貝・卵
  //   orange = サーモン・エビ・イクラ
  //   green  = 野菜・巻物
  // ゲーム中は絵文字で「色」を直感的に判断できるよう、色付き丸で表示。
  // 図鑑では絵文字も併用するため、emojiは色を示す丸、iconはネタを示す絵文字、にする。
  // ---- N (ノーマル) ----
  { id: 'maguro',    name: 'まぐろ',     emoji: '🔴', icon: '🐟', color: 'red',    rarity: 'N',   desc: '王道の赤身。間違いなし。' },
  { id: 'salmon',    name: 'サーモン',   emoji: '🟠', icon: '🍣', color: 'orange', rarity: 'N',   desc: '不動の人気者。とろける脂。' },
  { id: 'ika',       name: 'いか',       emoji: '⚪', icon: '🦑', color: 'white',  rarity: 'N',   desc: 'コリッとした食感が魅力。' },
  { id: 'tamago',    name: 'たまご',     emoji: '⚪', icon: '🍳', color: 'white',  rarity: 'N',   desc: '甘くてやさしい味。子供の定番。' },
  { id: 'kappa',     name: 'かっぱ巻き', emoji: '🟢', icon: '🥒', color: 'green',  rarity: 'N',   desc: 'きゅうりの細巻き。さっぱり。' },
  { id: 'natto',     name: '納豆巻き',   emoji: '🟢', icon: '🫘', color: 'green',  rarity: 'N',   desc: 'ねばねば派にはたまらない。' },

  // ---- R (レア) ----
  { id: 'ebi',       name: 'えび',       emoji: '🟠', icon: '🦐', color: 'orange', rarity: 'R',   desc: 'ぷりぷり食感。茹でて甘く。' },
  { id: 'hamachi',   name: 'はまち',     emoji: '⚪', icon: '🐟', color: 'white',  rarity: 'R',   desc: '脂のりが上品なブリの若魚。' },
  { id: 'tai',       name: 'たい',       emoji: '⚪', icon: '🐠', color: 'white',  rarity: 'R',   desc: 'おめでたい白身の代表。' },
  { id: 'ikura',     name: 'いくら',     emoji: '🟠', icon: '🍥', color: 'orange', rarity: 'R',   desc: 'プチプチはじける醤油の海。' },
  { id: 'tekka',     name: '鉄火巻き',   emoji: '🔴', icon: '🍙', color: 'red',    rarity: 'R',   desc: 'まぐろの細巻き。粋。' },
  { id: 'avocado',   name: 'アボカド',   emoji: '🟢', icon: '🥑', color: 'green',  rarity: 'R',   desc: 'クリーミーな新参者。' },

  // ---- SR (スーパーレア) ----
  { id: 'chu_toro',  name: '中とろ',     emoji: '🔴', icon: '🍣', color: 'red',    rarity: 'SR',  desc: '赤身ととろの中間。バランス◎' },
  { id: 'uni',       name: 'うに',       emoji: '🟠', icon: '⭐', color: 'orange', rarity: 'SR',  desc: '海のクリーム。濃厚な甘さ。' },
  { id: 'anago',     name: 'あなご',     emoji: '⚪', icon: '🍤', color: 'white',  rarity: 'SR',  desc: 'ふわっと甘いツメが香る。' },
  { id: 'hotate',    name: 'ほたて',     emoji: '⚪', icon: '🐚', color: 'white',  rarity: 'SR',  desc: '貝の王様。とろける甘み。' },

  // ---- SSR (超レア) : ガチャ専用の華やか枠 ----
  { id: 'o_toro',    name: '大とろ',     emoji: '🔴', icon: '💎', color: 'red',    rarity: 'SSR', desc: '寿司の頂点。口でとろける。' },
  { id: 'kohada',    name: 'こはだ',     emoji: '⚪', icon: '✨', color: 'white',  rarity: 'SSR', desc: '江戸前の粋。職人技が光る。' },
  { id: 'awabi',     name: 'あわび',     emoji: '⚪', icon: '👑', color: 'white',  rarity: 'SSR', desc: '高級貝の中の高級貝。' },
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
// SSRはガチャ専用の華やか枠なのでゲーム中には流さない。
function rollGameSushi() {
  const roll = Math.random() * 100;
  let rarity;
  if (roll < 8) rarity = 'R';
  else rarity = 'N';

  const pool = SUSHI_DATA.filter(s => s.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}
