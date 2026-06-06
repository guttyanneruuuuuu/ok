// =============================================================
// ゲーム本体 (Sushi Dash)
// =============================================================
//
// ゲームフロー:
//  1. ホームでスタート
//  2. ベルトに寿司が随時生成され右から左へ流れる
//  3. プレイヤーは寿司をタップ → 選択状態 → 皿をタップで仕分け
//  4. 正解: スコア+10, コンボ加算, コンボボーナス
//     不正解: コンボリセット, スコア-5
//     画面外に出た寿司: コンボリセット
//  5. 30秒経過で終了 → スコアをコインに変換 → リザルト表示
//
// =============================================================

// ---- グローバル状態 ----
let state = loadState();
let gameLoop = null;
let spawnLoop = null;
let countdownLoop = null;
let belt = null;
let selectedSushi = null;
let activeSushiList = [];   // ベルト上の寿司DOM＋データ
let runtime = {
  score: 0,
  combo: 0,
  maxCombo: 0,
  timeLeft: GAME_CONFIG.ROUND_DURATION,
  active: false,
};

// =============================================================
// ユーティリティ
// =============================================================
function $(id) { return document.getElementById(id); }
function $$(sel) { return document.querySelectorAll(sel); }

function refreshTopbar() {
  $('coin-count').textContent = state.coins;
}

function switchView(name) {
  $$('.view').forEach(v => v.classList.remove('active'));
  $('view-' + name).classList.add('active');
  $$('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === name);
  });

  if (name === 'home')       refreshHome();
  if (name === 'collection') renderCollection();
}

function refreshHome() {
  $('best-score').textContent  = state.bestScore;
  $('total-plays').textContent = state.totalPlays;
}

// =============================================================
// ベルト & 寿司管理
// =============================================================
function spawnSushi() {
  if (!runtime.active) return;
  const sushi = rollGameSushi();
  const el = document.createElement('div');
  el.className = 'sushi-item';
  // ベルト上は「色を判断する」ゲームなので、色丸 + 小さくネタ絵文字 を表示。
  el.innerHTML = `<span style="font-size:1.7rem;">${sushi.emoji}</span>` +
                 `<span style="position:absolute;bottom:-2px;right:-2px;font-size:0.95rem;background:#fff;border-radius:50%;padding:1px;">${sushi.icon || ''}</span>`;
  el.dataset.color = sushi.color;
  el.style.right = '-80px';
  el.style.transition = `right ${GAME_CONFIG.BELT_DURATION}ms linear`;

  // クリック/タップで選択
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!runtime.active) return;
    // 既に選択中なら解除
    document.querySelectorAll('.sushi-item.selected').forEach(s => s.classList.remove('selected'));
    el.classList.add('selected');
    selectedSushi = el;
  });

  belt.appendChild(el);

  // 開始位置から右→左に移動させる
  requestAnimationFrame(() => {
    el.style.right = (belt.clientWidth + 80) + 'px';
  });

  const entry = { el, sushi, spawnedAt: Date.now() };
  activeSushiList.push(entry);

  // ベルトを流れきった時の処理
  setTimeout(() => {
    if (!entry.el.isConnected) return; // 既に消されてる
    // ミス: 流れ切った
    if (selectedSushi === entry.el) selectedSushi = null;
    breakCombo();
    entry.el.remove();
    activeSushiList = activeSushiList.filter(s => s !== entry);
  }, GAME_CONFIG.BELT_DURATION);
}

function handlePlateClick(plateEl) {
  if (!runtime.active) return;
  if (!selectedSushi) {
    // 何も選んでいなければ振動的なフィードバックなし
    return;
  }
  const targetColor = plateEl.dataset.color;
  const sushiColor  = selectedSushi.dataset.color;
  const correct     = (targetColor === sushiColor);

  const rect = plateEl.getBoundingClientRect();
  const beltRect = belt.getBoundingClientRect();

  if (correct) {
    plateEl.classList.add('correct');
    setTimeout(() => plateEl.classList.remove('correct'), 400);

    runtime.combo += 1;
    if (runtime.combo > runtime.maxCombo) runtime.maxCombo = runtime.combo;
    const gained = 10 + (runtime.combo - 1) * GAME_CONFIG.COMBO_BONUS;
    runtime.score += gained;
    showPop(plateEl, `+${gained}`, false);
  } else {
    plateEl.classList.add('wrong');
    setTimeout(() => plateEl.classList.remove('wrong'), 400);
    runtime.score = Math.max(0, runtime.score - 5);
    showPop(plateEl, '-5', true);
    breakCombo();
  }

  // 寿司を消す
  const entry = activeSushiList.find(s => s.el === selectedSushi);
  if (entry) {
    entry.el.remove();
    activeSushiList = activeSushiList.filter(s => s !== entry);
  }
  selectedSushi = null;
  updateHUD();
}

function breakCombo() {
  runtime.combo = 0;
  updateHUD();
}

function showPop(plateEl, text, isMinus) {
  const pop = document.createElement('div');
  pop.className = 'pop' + (isMinus ? ' minus' : '');
  pop.textContent = text;
  const rect = plateEl.getBoundingClientRect();
  const appRect = $('app').getBoundingClientRect();
  pop.style.left = (rect.left - appRect.left + rect.width / 2 - 16) + 'px';
  pop.style.top  = (rect.top  - appRect.top  + 8) + 'px';
  pop.style.position = 'absolute';
  $('app').appendChild(pop);
  setTimeout(() => pop.remove(), 800);
}

function updateHUD() {
  $('hud-score').textContent = runtime.score;
  $('hud-combo').textContent = runtime.combo;
  $('hud-timer').textContent = runtime.timeLeft;
}

// =============================================================
// ラウンド開始/終了
// =============================================================
function startGame() {
  runtime = { score: 0, combo: 0, maxCombo: 0, timeLeft: GAME_CONFIG.ROUND_DURATION, active: false };
  selectedSushi = null;
  activeSushiList = [];
  belt.innerHTML = '';
  updateHUD();
  switchView('game');

  // 3秒カウントダウン演出
  showCountdown(() => {
    runtime.active = true;
    // タイマー
    countdownLoop = setInterval(() => {
      runtime.timeLeft -= 1;
      updateHUD();
      if (runtime.timeLeft <= 0) endGame();
    }, 1000);
    // 寿司生成
    spawnSushi();
    spawnLoop = setInterval(spawnSushi, GAME_CONFIG.SPAWN_INTERVAL);
  });
}

function showCountdown(onDone) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    background:rgba(255,248,240,0.85);font-size:5rem;font-weight:bold;color:#e63946;
    z-index:10;border-radius:14px;`;
  belt.style.position = 'relative';
  belt.appendChild(overlay);

  let n = 3;
  const tick = () => {
    if (n > 0) {
      overlay.textContent = n;
      overlay.style.animation = 'none';
      void overlay.offsetWidth;
      overlay.style.animation = 'bounce 0.5s ease';
      n--;
      setTimeout(tick, 600);
    } else {
      overlay.textContent = 'スタート！';
      setTimeout(() => { overlay.remove(); onDone(); }, 400);
    }
  };
  tick();
}

function endGame() {
  runtime.active = false;
  clearInterval(spawnLoop);
  clearInterval(countdownLoop);
  spawnLoop = null;
  countdownLoop = null;

  // 残っている寿司をクリーンアップ
  activeSushiList.forEach(s => s.el && s.el.remove());
  activeSushiList = [];
  selectedSushi = null;

  const earnedCoins = Math.floor(runtime.score * GAME_CONFIG.COIN_PER_SCORE);
  state.coins += earnedCoins;
  state.totalPlays += 1;
  const isNewBest = runtime.score > state.bestScore;
  if (isNewBest) state.bestScore = runtime.score;
  saveState(state);
  refreshTopbar();

  // リザルト表示
  $('result-score').textContent     = runtime.score;
  $('result-max-combo').textContent = runtime.maxCombo;
  $('result-coin').textContent      = `🪙 ${earnedCoins}`;
  $('result-new-best').style.display = isNewBest ? 'block' : 'none';
  $('result-overlay').classList.add('active');
}

function quitGame() {
  if (!runtime.active) return;
  if (!confirm('ゲームを中断しますか？\nスコアはコインに変換されません。')) return;
  runtime.active = false;
  clearInterval(spawnLoop);
  clearInterval(countdownLoop);
  spawnLoop = null;
  countdownLoop = null;
  activeSushiList.forEach(s => s.el && s.el.remove());
  activeSushiList = [];
  selectedSushi = null;
  switchView('home');
}

// =============================================================
// コレクション描画
// =============================================================
function renderCollection() {
  const grid = $('collection-grid');
  grid.innerHTML = '';
  SUSHI_DATA.forEach(sushi => {
    const count = state.collection[sushi.id] || 0;
    const cell = document.createElement('div');
    cell.className = 'collection-cell' + (count > 0 ? '' : ' locked');
    cell.innerHTML = `
      <span class="rarity-dot" style="background:${RARITY_COLORS[sushi.rarity]}">${sushi.rarity[0]}</span>
      <span class="emoji">${count > 0 ? (sushi.icon || sushi.emoji) : '❔'}</span>
      <span class="name">${count > 0 ? sushi.name : '???'}</span>
      ${count > 1 ? `<span class="count">x${count}</span>` : ''}
    `;
    if (count > 0) {
      cell.addEventListener('click', () => {
        alert(`${sushi.name} (${sushi.rarity})\n\n${sushi.desc}\n\n所持: ${count}`);
      });
    }
    grid.appendChild(cell);
  });

  const prog = collectionProgress(state);
  $('coll-owned').textContent  = prog.owned;
  $('coll-total').textContent  = prog.total;
  $('coll-progress').style.width = (prog.ratio * 100).toFixed(1) + '%';
}

// =============================================================
// イベントバインド
// =============================================================
function bindEvents() {
  // タブ切替
  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // ゲーム開始
  $('start-btn').addEventListener('click', startGame);
  $('quit-btn').addEventListener('click', quitGame);

  // 皿
  $$('.plate').forEach(p => {
    p.addEventListener('click', () => handlePlateClick(p));
  });

  // リザルト
  $('result-retry').addEventListener('click', () => {
    $('result-overlay').classList.remove('active');
    startGame();
  });
  $('result-home').addEventListener('click', () => {
    $('result-overlay').classList.remove('active');
    switchView('home');
  });
  $('result-gacha').addEventListener('click', () => {
    $('result-overlay').classList.remove('active');
    switchView('gacha');
  });

  // ガチャ
  $('gacha-cost').textContent = GAME_CONFIG.GACHA_COST;
  $('gacha-once').addEventListener('click', () => {
    if (!Gacha.canRoll(state)) {
      alert('コインが足りません！\nゲームをプレイして稼ごう。');
      return;
    }
    const result = Gacha.rollOnce(state);
    refreshTopbar();
    Gacha.playAnimation(result, () => {
      // ガチャ後に図鑑が更新されるので画面側でも反映
      if (document.querySelector('#view-collection.active')) renderCollection();
    });
  });

  // リセット
  $('reset-btn').addEventListener('click', () => {
    if (!confirm('すべてのデータを削除して最初からやり直しますか？\nこの操作は元に戻せません。')) return;
    resetState();
    state = loadState();
    refreshTopbar();
    refreshHome();
    renderCollection();
    alert('データをリセットしました。');
  });
}

// =============================================================
// 初期化
// =============================================================
document.addEventListener('DOMContentLoaded', () => {
  belt = $('belt');
  bindEvents();
  refreshTopbar();
  refreshHome();
  renderCollection();
});
