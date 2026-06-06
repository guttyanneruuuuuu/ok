// =============================================================
// ガチャシステム
// =============================================================

const Gacha = (() => {

  function canRoll(state) {
    return state.coins >= GAME_CONFIG.GACHA_COST;
  }

  // 1回ガチャ：コインを消費して新しいネタを返す
  function rollOnce(state) {
    if (!canRoll(state)) return null;
    state.coins -= GAME_CONFIG.GACHA_COST;
    state.totalGacha = (state.totalGacha || 0) + 1;
    const sushi = rollGacha();
    const isNew = !isOwned(state, sushi.id);
    state.collection[sushi.id] = (state.collection[sushi.id] || 0) + 1;
    saveState(state);
    return { sushi, isNew };
  }

  // 演出: オーバーレイで開封 → リザルト表示
  function playAnimation(result, onClose) {
    const overlay = document.getElementById('gacha-anim');
    const stage   = document.getElementById('gacha-anim-stage');

    // 初期：開封中
    stage.innerHTML = `
      <div class="gacha-anim-icon">🎁</div>
      <div style="margin-top:16px;font-weight:bold;">開封中...</div>
    `;
    overlay.classList.add('active');

    const delay = result.sushi.rarity === 'SSR' ? 1800
               : result.sushi.rarity === 'SR'  ? 1400
               : 1100;

    setTimeout(() => {
      const color = RARITY_COLORS[result.sushi.rarity];
      stage.innerHTML = `
        <div class="gacha-result-card">
          <div class="gacha-result-emoji">${result.sushi.icon || result.sushi.emoji}</div>
          <div class="rarity-badge" style="background:${color};">${result.sushi.rarity}</div>
          <h3>${result.sushi.name}</h3>
          <div class="desc">${result.sushi.desc}</div>
          ${result.isNew ? '<div class="new-tag">NEW!</div>' : ''}
          <div style="margin-top:16px;">
            <button class="btn-primary" id="gacha-close">OK</button>
          </div>
        </div>
      `;
      document.getElementById('gacha-close').addEventListener('click', () => {
        overlay.classList.remove('active');
        onClose && onClose();
      });
    }, delay);
  }

  return { canRoll, rollOnce, playAnimation };
})();
