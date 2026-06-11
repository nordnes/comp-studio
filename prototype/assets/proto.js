/* Comp Studio prototype shell + interaction helpers (vanilla JS, no build) — v2 */
(function () {
  const NAV = [
    { group: 'Board', items: [['overview.html', 'Overview'], ['board.html', 'Board'], ['compare.html', 'Compare'], ['tokens.html', 'Tokens'], ['governance.html', 'Governance']] },
    { group: 'Advisor', items: [['advisor.html', 'Advisors'], ['proposition.html', 'Proposition'], ['portal.html', 'Advisor portal']] },
    { group: 'System', items: [['configure.html', 'Configure'], ['dialogs.html', 'Dialog system'], ['board-pack.html', 'Board pack'], ['auth.html', 'Auth & states'], ['index.html', 'Prototype map']] },
  ];
  const ADVISORS = ['Iraj Ispahani', 'Robert Reoch', 'Martin Keller', 'Kerim Derhalli', 'Carl Bang', 'Rajesh Mehta'];
  const here = location.pathname.split('/').pop() || 'index.html';

  // ---- mock engine: per-element case values via data-money='{"con":"…","base":"…","agg":"…"}'
  const CASE = { key: localStorage.getItem('proto-case') || 'base', names: { con: 'Conservative', base: 'Base', agg: 'Aggressive' } };
  function applyCase() {
    document.querySelectorAll('[data-money]').forEach(el => {
      try { el.textContent = JSON.parse(el.dataset.money)[CASE.key]; } catch (e) { }
    });
    document.querySelectorAll('[data-case-label]').forEach(el => { el.textContent = CASE.names[CASE.key]; });
    document.querySelectorAll('.case-select').forEach(sel => { sel.value = CASE.key; });
  }
  window.setCase = function (key) {
    CASE.key = key; localStorage.setItem('proto-case', key); applyCase();
    window.toast('Case → ' + CASE.names[key] + ' · every figure recomputed', 'Undo');
  };

  function navHtml(forDrawer) {
    return NAV.map(g => `
      <div class="px-3 pt-5">
        <div class="px-2 pb-1 text-xs font-medium" style="color:var(--ink-gray-5)" role="presentation">${g.group}</div>
        ${g.items.map(([href, label]) => `
          <a href="${href}" ${here === href ? 'aria-current="page"' : ''}
             class="block rounded px-2 py-1.5 text-sm ${here === href ? 'font-medium' : ''}"
             style="${here === href ? 'background:var(--surface-gray-3);color:var(--ink-gray-9)' : 'color:var(--ink-gray-7)'}">${label}</a>`).join('')}
      </div>`).join('');
  }
  function switchersHtml(idSuffix) {
    return `
      <div class="px-5 pt-4 space-y-2 text-sm">
        <label class="flex items-center gap-2"><span class="eyebrow w-10">Case</span>
          <select id="case-select${idSuffix || ''}" class="case-select flex-1 border rounded px-2 py-1 text-sm" style="border-color:var(--outline-gray-2)" aria-label="Scenario case">
            <option value="con">Conservative</option><option value="base">Base</option><option value="agg">Aggressive</option>
          </select></label>
        <label class="flex items-center gap-2"><span class="eyebrow w-10">Stage</span>
          <select class="flex-1 border rounded px-2 py-1 text-sm" style="border-color:var(--outline-gray-2)" aria-label="Plan stage">
            <option>Bridge close</option><option>Series A</option><option>Series B</option><option>Series C</option>
          </select></label>
      </div>`;
  }

  function shell() {
    document.body.insertAdjacentHTML('afterbegin', `
      <a class="skip-link" href="#main">Skip to content</a>
      <div class="min-h-screen flex">
        <aside class="no-print hidden md:flex w-56 shrink-0 flex-col border-r" style="border-color:var(--outline-gray-1);background:var(--surface-gray-1)" aria-label="Primary">
          <div class="px-5 pt-5 flex items-baseline gap-2">
            <span class="font-display text-lg">Raiku Labs</span>
            <span class="text-[11px] font-semibold tracking-wide" style="color:var(--ink-amber-strong)">INTERNAL</span>
          </div>
          <div class="px-3 pt-4">
            <button class="w-full text-left text-sm rounded border px-3 py-1.5 flex justify-between items-center" style="border-color:var(--outline-gray-2);color:var(--ink-gray-6)" aria-label="Search" aria-keyshortcuts="Meta+K" onclick="openPalette()">
              <span>Search</span><span aria-hidden="true" class="text-xs">&#8984;K</span>
            </button>
          </div>
          ${switchersHtml('')}
          <nav class="flex-1">${navHtml()}</nav>
          <div class="p-4 text-xs" style="color:var(--ink-gray-5)">Prototype &middot; planned design v2<br/>2026-06-11</div>
        </aside>
        <div class="flex-1 min-w-0 flex flex-col">
          <header class="no-print sticky top-0 z-20 border-b" style="background:var(--surface-white);border-color:var(--outline-gray-1)">
            <div class="flex items-center gap-3 h-12 px-4">
              <button class="md:hidden btn" style="padding:4px 9px" aria-label="Open navigation" onclick="openDrawer()">&#9776;</button>
              <nav aria-label="Breadcrumb" class="text-sm truncate" style="color:var(--ink-gray-6)">
                <span class="hidden sm:inline truncate">Advisory board — working draft</span>
                <span class="hidden sm:inline" aria-hidden="true"> / </span>
                <span class="font-medium" style="color:var(--ink-gray-9)">${document.title.replace(' · Comp Studio prototype', '')}</span>
              </nav>
              <div class="ml-auto flex items-center gap-2">
                <button class="status-chip" id="budget-chip" aria-haspopup="dialog" title="Budget warning — click for detail">
                  <span class="dot" aria-hidden="true"></span><span class="hidden sm:inline"> 1 budget warning</span><span class="sm:hidden">1</span>
                </button>
                <div id="page-actions" class="hidden lg:flex items-center gap-2"></div>
                <button class="btn" id="more-actions" aria-label="More actions" aria-haspopup="menu">&#8943;</button>
              </div>
            </div>
          </header>
          <main id="main" class="flex-1">${document.getElementById('page').innerHTML}</main>
          <footer class="no-print border-t mt-12 px-6 py-5 text-xs leading-relaxed" style="border-color:var(--outline-gray-1);color:var(--ink-gray-6)">
            <span class="font-medium" style="color:var(--ink-gray-7)">Patterns applied on this page:</span>
            <span id="patterns-note">${(document.getElementById('page').dataset.patterns) || ''}</span>
          </footer>
        </div>
      </div>

      <!-- mobile drawer -->
      <div class="dlg-backdrop" id="nav-drawer" role="dialog" aria-modal="true" aria-label="Navigation" style="justify-content:flex-start;padding:0">
        <div style="background:var(--surface-gray-1);width:260px;max-width:80vw;height:100%;overflow-y:auto;border-right:1px solid var(--outline-gray-1)">
          <div class="px-5 pt-5 pb-2 flex items-center justify-between">
            <span class="font-display text-lg">Raiku Labs</span>
            <button class="btn" onclick="closeDialog('nav-drawer')" aria-label="Close navigation">&#10005;</button>
          </div>
          ${switchersHtml('-m')}
          <nav>${navHtml(true)}</nav>
        </div>
      </div>

      <!-- command palette -->
      <div class="dlg-backdrop" id="palette" role="dialog" aria-modal="true" aria-label="Search" style="align-items:flex-start;padding-top:12vh">
        <div class="dlg" style="max-width:520px">
          <div class="p-3 border-b" style="border-color:var(--outline-gray-1)">
            <input id="palette-input" class="w-full text-sm px-2 py-1.5 outline-none" placeholder="Go to a view or an advisor…" aria-label="Search views and advisors" role="combobox" aria-expanded="true" aria-controls="palette-list">
          </div>
          <div class="dlg-body" style="padding:8px" id="palette-list" role="listbox"></div>
        </div>
      </div>
      <div id="toast-region" role="region" aria-label="Notifications"></div>`);
    document.getElementById('page').remove();

    const actions = window.PAGE_ACTIONS || [];
    const slot = document.getElementById('page-actions');
    actions.forEach(([label, solid, onclick]) => slot.insertAdjacentHTML('beforeend', `<button class="btn ${solid ? 'btn-solid' : ''}" ${onclick ? `onclick="${onclick}"` : ''}>${label}</button>`));
    document.getElementById('more-actions').addEventListener('click', () =>
      window.toast('Overflow menu: ' + (actions.map(a => a[0]).join(' · ') || 'Share · Print · Reset') + ' (collapses below 1024px)'));

    document.getElementById('budget-chip').addEventListener('click', () =>
      window.openDialog('budget-detail-dlg') || window.toast('At ceiling, board tokens 4.83% exceed the 4.50% bucket — review the pool on the Board.'));

    document.querySelectorAll('.case-select').forEach(s => s.addEventListener('change', e => setCase(e.target.value)));
    applyCase();
  }

  // ---- drawer + palette
  window.openDrawer = () => { document.getElementById('nav-drawer').classList.add('open'); };
  window.openPalette = () => {
    document.getElementById('palette').classList.add('open');
    const inp = document.getElementById('palette-input'); inp.value = ''; renderPalette(''); inp.focus();
  };
  function renderPalette(q) {
    const list = document.getElementById('palette-list');
    const views = NAV.flatMap(g => g.items.map(([href, label]) => ({ href, label, group: g.group })));
    const adv = ADVISORS.map(a => ({ href: 'advisor.html', label: a, group: 'Advisors' }));
    const all = [...views, ...adv].filter(x => x.label.toLowerCase().includes(q.toLowerCase()));
    list.innerHTML = all.length ? all.map((x, i) => `
      <a href="${x.href}" role="option" class="flex justify-between items-center rounded px-3 py-2 text-sm ${i === 0 ? 'pal-active' : ''}" style="${i === 0 ? 'background:var(--surface-gray-2)' : ''};color:var(--ink-gray-8)">
        <span>${x.label}</span><span class="text-xs" style="color:var(--ink-gray-5)">${x.group}</span></a>`).join('')
      : `<div class="px-3 py-6 text-sm text-center" style="color:var(--ink-gray-6)">No matches for “${q}” — try a view name or an advisor.</div>`;
  }
  document.addEventListener('input', e => { if (e.target.id === 'palette-input') renderPalette(e.target.value); });
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); }
    if (e.key === 'Enter' && document.activeElement?.id === 'palette-input') {
      const first = document.querySelector('#palette-list a'); if (first) location.href = first.getAttribute('href');
    }
    if (e.key === 'Escape') document.querySelectorAll('.dlg-backdrop.open').forEach(d => d.classList.remove('open'));
  });

  // ---- toast with undo (WS-C grammar)
  window.toast = function (msg, undoLabel) {
    const region = document.getElementById('toast-region');
    const el = document.createElement('div');
    el.className = 'toast'; el.setAttribute('role', 'status');
    el.innerHTML = `<span>${msg}</span>${undoLabel ? `<button>${undoLabel}</button>` : ''}<button aria-label="Dismiss">&#10005;</button>`;
    const btns = el.querySelectorAll('button');
    btns[btns.length - 1].onclick = () => el.remove();
    if (undoLabel) btns[0].onclick = () => { el.remove(); window.toast('Reverted.'); };
    region.appendChild(el);
    setTimeout(() => el.remove(), 6000);
  };

  // ---- dialog system (AppDialog grammar)
  window.openDialog = function (id) {
    const dlg = document.getElementById(id);
    if (!dlg) return false;
    dlg.classList.add('open');
    const panel = dlg.querySelector('.dlg'); if (panel) { panel.setAttribute('tabindex', '-1'); panel.focus(); }
    return true;
  };
  window.closeDialog = function (id) { document.getElementById(id)?.classList.remove('open'); };
  document.addEventListener('click', e => {
    if (e.target.classList && e.target.classList.contains('dlg-backdrop')) e.target.classList.remove('open');
  });

  // ---- formula popover (9d)
  document.addEventListener('click', e => {
    document.querySelectorAll('.popover').forEach(p => p.remove());
    const t = e.target.closest('[data-formula]');
    if (!t) return;
    const pop = document.createElement('div');
    pop.className = 'popover';
    pop.innerHTML = `<div class="section-label" style="margin-bottom:6px">How this number is computed</div>
      <div class="tnum" style="white-space:pre-line;color:var(--ink-gray-7)">${t.dataset.formula}</div>
      <div class="eyebrow" style="margin-top:8px">Engine trace &middot; values live, formula fixed &middot; <a href="#" style="text-decoration:underline">copy</a></div>`;
    document.body.appendChild(pop);
    const r = t.getBoundingClientRect();
    pop.style.left = Math.min(r.left, innerWidth - 360) + 'px';
    pop.style.top = (r.bottom + 8 + scrollY) + 'px';
    e.preventDefault();
  });

  // ---- exit slider two-tone fill
  window.wireSlider = function (id, out, fmt) {
    const el = document.getElementById(id);
    const render = () => {
      const pct = ((el.value - el.min) / (el.max - el.min)) * 100;
      el.style.setProperty('--pct', pct + '%');
      if (out) document.getElementById(out).textContent = fmt(parseFloat(el.value));
    };
    el.addEventListener('input', render); render();
  };

  // ---- tabs helper (advisor detail)
  window.wireTabs = function (rootId) {
    const root = document.getElementById(rootId); if (!root) return;
    const tabs = root.querySelectorAll('[role=tab]');
    tabs.forEach(t => t.addEventListener('click', () => {
      tabs.forEach(x => { x.setAttribute('aria-selected', 'false'); x.style.borderColor = 'transparent'; x.style.color = 'var(--ink-gray-6)'; });
      t.setAttribute('aria-selected', 'true'); t.style.borderColor = 'var(--ink-gray-9)'; t.style.color = 'var(--ink-gray-9)';
      document.querySelectorAll('[data-tabpanel]').forEach(p => p.hidden = p.dataset.tabpanel !== t.dataset.tab);
    }));
  };

  // ---- RAG radiogroup with inline why-note (5.1/5.2)
  window.wireRag = function (root) {
    root.querySelectorAll('.rag').forEach(rag => {
      rag.setAttribute('role', 'radiogroup');
      rag.querySelectorAll('button').forEach(b => {
        b.setAttribute('role', 'radio');
        b.addEventListener('click', () => {
          rag.querySelectorAll('button').forEach(x => x.setAttribute('aria-checked', 'false'));
          b.setAttribute('aria-checked', 'true');
          const row = rag.closest('[data-item]');
          let note = row.querySelector('.why-note');
          if (!note) {
            note = document.createElement('div');
            note.className = 'why-note flex items-center gap-2 mt-2';
            note.innerHTML = `<input placeholder="Why? (optional — lands on the audit trail)" class="text-sm border rounded px-2 py-1 flex-1" style="border-color:var(--outline-gray-2)">
              <button class="btn">Record</button>`;
            note.querySelector('.btn').onclick = () => { note.remove(); window.toast(`${row.dataset.item} → ${b.textContent} recorded`, 'Undo'); };
            row.appendChild(note);
          }
        });
      });
    });
  };

  document.addEventListener('DOMContentLoaded', shell);
})();
