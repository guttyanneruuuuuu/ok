// =============================================================
// セーブデータ管理（LocalStorage）
// =============================================================
// 完全クライアントサイド保存でサーバー費用ゼロ。
// 将来クラウド同期する場合もこの層を差し替えるだけでOK。
// =============================================================

const STORAGE_KEY = 'sushiDash.save.v1';

const DEFAULT_STATE = {
  coins: 0,
  bestScore: 0,
  totalPlays: 0,
  collection: {},   // { sushiId: ownedCount }
  totalGacha: 0,
  lastBonus: 0,     // デイリーボーナス用 (unix ms)
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch (e) {
    console.warn('save load failed', e);
    return { ...DEFAULT_STATE };
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('save failed', e);
  }
}

function resetState() {
  localStorage.removeItem(STORAGE_KEY);
}

// 取得済み判定
function isOwned(state, sushiId) {
  return (state.collection[sushiId] || 0) > 0;
}

// 図鑑コンプ率（0-1）
function collectionProgress(state) {
  const total = SUSHI_DATA.length;
  const owned = Object.values(state.collection).filter(v => v > 0).length;
  return { owned, total, ratio: owned / total };
}

// デイリーボーナス受け取り可能か
function canClaimDaily(state) {
  const now = Date.now();
  const last = state.lastBonus || 0;
  return (now - last) > 20 * 60 * 60 * 1000; // 20時間でリセット
}
