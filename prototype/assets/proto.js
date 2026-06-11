/* Comp Studio prototype shell + interaction helpers (vanilla JS, no build) — v3 */
(function () {
  const NAV = [
    { group: 'Board', items: [['overview.html', 'Overview'], ['board.html', 'Board'], ['compare.html', 'Compare'], ['tokens.html', 'Tokens'], ['governance.html', 'Governance']] },
    { group: 'Advisor', items: [['advisor.html', 'Advisors'], ['proposition.html', 'Proposition'], ['portal.html', 'Advisor portal']] },
    { group: 'Plan', items: [['configure.html', 'Configure'], ['board-pack.html', 'Board pack']] },
    { group: 'Spec', quiet: true, items: [['dialogs.html', 'Dialog system'], ['auth.html', 'Auth & states'], ['index.html', 'Prototype map']] },
  ];
  const ADVISORS = ['Iraj Ispahani', 'Robert Reoch', 'Martin Keller', 'Kerim Derhalli', 'Carl Bang', 'Rajesh Mehta'];
  const here = location.pathname.split('/').pop() || 'index.html';

  // ---- mock engine v2: one state (case × stage), persisted; elements opt in via
  //      data-money='{"con":"…","base":"…","agg":"…"}'   (case-driven figures)
  //      data-stage-text='{"bridge":"…","seriesA":"…","seriesB":"…","seriesC":"…"}' (stage-driven labels)
  //      data-case-label / data-stage-label              (the active case/stage name)
  //      data-case-active="con|base|agg"                 (gets .case-active when its case is live)
  const CASES = { con: 'Conservative', base: 'Base', agg: 'Aggressive' };
  const STAGES = { bridge: 'Bridge close', seriesA: 'Series A', seriesB: 'Series B', seriesC: 'Series C' };
  const STATE = {
    caseKey: CASES[localStorage.getItem('proto-case')] ? localStorage.getItem('proto-case') : 'base',
    stageKey: STAGES[localStorage.getItem('proto-stage')] ? localStorage.getItem('proto-stage') : 'bridge',
  };
  window.PROTO_STATE = STATE;

  function pulseText(el, next, pulse) {
    if (el.textContent === next) return;
    el.textContent = next;
    if (!pulse) return;
    el.classList.remove('value-pulse');
    requestAnimationFrame(() => el.classList.add('value-pulse'));
    setTimeout(() => el.classList.remove('value-pulse'), 700);
  }
  function renderState(pulse) {
    document.querySelectorAll('[data-money]').forEach(el => {
      try { pulseText(el, JSON.parse(el.dataset.money)[STATE.caseKey], pulse); } catch (e) { }
    });
    document.querySelectorAll('[data-stage-text]').forEach(el => {
      try { pulseText(el, JSON.parse(el.dataset.stageText)[STATE.stageKey], pulse); } catch (e) { }
    });
    document.querySelectorAll('[data-pos]').forEach(el => {
      try {
        const next = JSON.parse(el.dataset.pos)[STATE.caseKey];
        if (next) el.style.left = next;
      } catch (e) { }
    });
    document.querySelectorAll('[data-case-label]').forEach(el => pulseText(el, CASES[STATE.caseKey], pulse));
    document.querySelectorAll('[data-stage-label]').forEach(el => pulseText(el, STAGES[STATE.stageKey], pulse));
    document.querySelectorAll('[data-case-active]').forEach(el =>
      el.classList.toggle('case-active', el.dataset.caseActive === STATE.caseKey));
    document.querySelectorAll('.case-select').forEach(sel => { sel.value = STATE.caseKey; });
    document.querySelectorAll('.stage-select').forEach(sel => { sel.value = STATE.stageKey; });
  }
  window.setCase = function (key, opts) {
    if (!CASES[key] || key === STATE.caseKey) return;
    const prev = STATE.caseKey;
    STATE.caseKey = key; localStorage.setItem('proto-case', key); renderState(true);
    if (!(opts && opts.silent)) window.toast('Case → ' + CASES[key], () => window.setCase(prev, { silent: true }));
  };
  window.setStage = function (key, opts) {
    if (!STAGES[key] || key === STATE.stageKey) return;
    const prev = STATE.stageKey;
    STATE.stageKey = key; localStorage.setItem('proto-stage', key); renderState(true);
    if (!(opts && opts.silent)) window.toast('Stage → ' + STAGES[key], () => window.setStage(prev, { silent: true }));
  };
  // pages may rewrite data-money / data-stage-text JSON (e.g. a re-anchor) then re-render
  window.renderProtoState = renderState;

  function navHtml() {
    return NAV.map(g => `
      <div class="px-3 ${g.quiet ? 'pt-6 mt-auto pb-1' : 'pt-5'}">
        <div class="px-2 pb-1 ${g.quiet ? 'text-[11px]' : 'text-xs'} font-medium" style="color:var(--ink-gray-5)" role="presentation">${g.group}</div>
        ${g.items.map(([href, label]) => `
          <a href="${href}" ${here === href ? 'aria-current="page"' : ''}
             class="block rounded px-2 py-1.5 ${g.quiet ? 'text-xs' : 'text-sm'} ${here === href ? 'font-medium' : ''}"
             style="${here === href ? 'background:var(--surface-gray-3);color:var(--ink-gray-9)' : `color:var(--ink-gray-${g.quiet ? '5' : '7'})`}">${label}</a>`).join('')}
      </div>`).join('');
  }
  function switchersHtml() {
    return `
      <div class="px-5 pt-4 space-y-2 text-sm">
        <label class="flex items-center gap-2"><span class="eyebrow w-10">Case</span>
          <select class="case-select flex-1 border rounded px-2 py-1 text-sm" style="border-color:var(--outline-gray-2)" aria-label="Scenario case">
            <option value="con">Conservative</option><option value="base">Base</option><option value="agg">Aggressive</option>
          </select></label>
        <label class="flex items-center gap-2"><span class="eyebrow w-10">Stage</span>
          <select class="stage-select flex-1 border rounded px-2 py-1 text-sm" style="border-color:var(--outline-gray-2)" aria-label="Plan stage">
            <option value="bridge">Bridge close</option><option value="seriesA">Series A</option><option value="seriesB">Series B</option><option value="seriesC">Series C</option>
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
          ${switchersHtml()}
          <nav class="flex-1 flex flex-col pb-2">${navHtml()}</nav>
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
                <button class="status-chip" id="budget-chip" aria-haspopup="dialog" aria-label="1 budget warning — details">
                  <span class="dot" aria-hidden="true"></span><span class="hidden sm:inline"> 1 budget warning</span><span class="sm:hidden">1</span>
                </button>
                <div id="page-actions" class="hidden lg:flex items-center gap-2"></div>
                <button class="btn" id="more-actions" aria-label="More actions" aria-haspopup="menu">&#8943;</button>
              </div>
            </div>
          </header>
          <main id="main" class="flex-1">${document.getElementById('page').innerHTML}</main>
          <footer class="no-print border-t mt-12 px-6 py-5 text-xs leading-relaxed" style="border-color:var(--outline-gray-1);color:var(--ink-gray-6)">
            Internal &amp; confidential &middot; every equity figure net of strike &middot; a discussion draft, not a binding offer.
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
          ${switchersHtml()}
          <nav class="flex flex-col pb-4">${navHtml()}</nav>
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
    document.getElementById('more-actions').addEventListener('click', e => {
      e.stopPropagation();
      const items = (window.PAGE_ACTIONS || []).filter(a => a[2]).map(a => [a[0], a[2]]);
      items.push(['Print this page', 'window.print()']);
      openPopover(e.currentTarget,
        items.map(([label, fn]) => `<button role="menuitem" class="block w-full text-left rounded px-3 py-1.5 text-sm hover:bg-[var(--surface-gray-1)]" style="color:var(--ink-gray-8)" onclick="${fn.replace(/"/g, '&quot;')}">${label}</button>`).join(''),
        { menu: true });
    });

    document.getElementById('budget-chip').addEventListener('click', () =>
      window.openDialog('budget-detail-dlg') || window.toast('At ceiling, board tokens 4.83% exceed the 4.50% bucket — review the pool on the Board.'));

    document.querySelectorAll('.case-select').forEach(s => s.addEventListener('change', e => setCase(e.target.value)));
    document.querySelectorAll('.stage-select').forEach(s => s.addEventListener('change', e => setStage(e.target.value)));
    document.querySelectorAll('[data-pop]:not([tabindex])').forEach(el => el.setAttribute('tabindex', '0'));
    renderState(false);
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
    if (e.key === 'Escape') {
      document.querySelectorAll('.dlg-backdrop.open').forEach(d => d.classList.remove('open'));
      closePops();
    }
  });

  // ---- toast: honest by construction. The second argument is a restore CLOSURE —
  //      no closure, no Undo button; "Reverted." prints only after the closure ran.
  window.toast = function (msg, undoFn) {
    const region = document.getElementById('toast-region');
    if (!region) return;
    const el = document.createElement('div');
    el.className = 'toast'; el.setAttribute('role', 'status');
    const hasUndo = typeof undoFn === 'function';
    el.innerHTML = `<span>${msg}</span>${hasUndo ? '<button>Undo</button>' : ''}<button aria-label="Dismiss">&#10005;</button>`;
    const btns = el.querySelectorAll('button');
    btns[btns.length - 1].onclick = () => el.remove();
    if (hasUndo) btns[0].onclick = () => { el.remove(); undoFn(); window.toast('Reverted.'); };
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

  // ---- popovers: one primitive for formulas, data-pop tooltips and small menus
  function closePops() { document.querySelectorAll('.popover').forEach(p => p.remove()); }
  window.closePops = closePops;
  window.openPopover = function (target, html, opts) {
    closePops();
    const pop = document.createElement('div');
    pop.className = 'popover';
    pop.setAttribute('role', (opts && opts.menu) ? 'menu' : 'tooltip');
    if (opts && opts.menu) { pop.style.width = '230px'; pop.style.padding = '6px'; }
    pop.innerHTML = html;
    document.body.appendChild(pop);
    const r = target.getBoundingClientRect();
    pop.style.left = Math.max(8, Math.min(r.left, innerWidth - (pop.offsetWidth + 12))) + 'px';
    pop.style.top = (r.bottom + 8 + scrollY) + 'px';
    return pop;
  };
  function popText(el) {
    const raw = el.dataset.pop;
    try {
      const o = JSON.parse(raw);
      if (o && typeof o === 'object') return o[STATE.caseKey] || o.base || raw;
    } catch (e) { }
    return raw;
  }
  document.addEventListener('click', e => {
    if (e.target.closest && e.target.closest('.popover')) return;
    closePops();
    const t = e.target.closest ? e.target.closest('[data-formula]') : null;
    const p = e.target.closest ? e.target.closest('[data-pop]') : null;
    if (t) {
      openPopover(t, `<div class="section-label" style="margin-bottom:6px">How this number is computed</div>
        <div class="tnum" style="white-space:pre-line;color:var(--ink-gray-7)">${t.dataset.formula}</div>
        <div class="eyebrow" style="margin-top:8px">Engine trace &middot; values live, formula fixed</div>`);
      e.preventDefault();
    } else if (p) {
      openPopover(p, `<div class="text-sm tnum" style="color:var(--ink-gray-8)">${popText(p)}</div>`);
      e.preventDefault();
    }
  });
  document.addEventListener('focusin', e => {
    const p = e.target.closest ? e.target.closest('[data-pop]') : null;
    if (p) openPopover(p, `<div class="text-sm tnum" style="color:var(--ink-gray-8)">${popText(p)}</div>`);
  });
  document.addEventListener('focusout', e => {
    if (e.target.closest && e.target.closest('[data-pop]')) closePops();
  });
  // hover opens the same popover (chart bars, chips); leaving the trigger closes it
  let hoverPop = null;
  document.addEventListener('mouseover', e => {
    const p = e.target.closest ? e.target.closest('[data-pop]') : null;
    if (!p || p === hoverPop) return;
    hoverPop = p;
    openPopover(p, `<div class="text-sm tnum" style="color:var(--ink-gray-8)">${popText(p)}</div>`);
  });
  document.addEventListener('mouseout', e => {
    const p = e.target.closest ? e.target.closest('[data-pop]') : null;
    if (p && p === hoverPop) { hoverPop = null; closePops(); }
  });
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset && e.target.dataset.pop !== undefined) {
      e.preventDefault();
      openPopover(e.target, `<div class="text-sm tnum" style="color:var(--ink-gray-8)">${popText(e.target)}</div>`);
    }
  });

  // ---- generic dialog radiogroups (tier picker, leaver type, share scope)
  document.addEventListener('click', e => {
    const radio = e.target.closest ? e.target.closest('[role=radiogroup] [role=radio]') : null;
    if (!radio || radio.closest('.rag')) return;
    radio.closest('[role=radiogroup]').querySelectorAll('[role=radio]').forEach(r => {
      const on = r === radio;
      r.setAttribute('aria-checked', on);
      if (r.classList.contains('frame')) {
        r.style.borderColor = on ? 'var(--ink-amber-3)' : '';
        r.style.background = on ? 'var(--surface-amber-1)' : '';
      }
    });
  });

  // ---- CSV export: a real file, built from the table the user is looking at
  window.exportTableCsv = function (tableId, filename) {
    const table = document.getElementById(tableId); if (!table) return false;
    const rows = [...table.querySelectorAll('tr')].map(tr =>
      [...tr.querySelectorAll('th,td')].map(c => '"' + c.innerText.trim().replace(/\s+/g, ' ').replace(/"/g, '""') + '"').join(','));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename; a.click();
    URL.revokeObjectURL(a.href);
    return true;
  };

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

  // ---- RAG radiogroup with inline why-note; the flip is real, the undo restores it,
  //      and Record appends a real row to the page's audit log (#audit-rows) if present
  window.wireRag = function (root) {
    root.querySelectorAll('.rag').forEach(rag => {
      rag.setAttribute('role', 'radiogroup');
      rag.querySelectorAll('button').forEach(b => {
        b.setAttribute('role', 'radio');
        b.addEventListener('click', () => {
          const prev = rag.querySelector('button[aria-checked=true]');
          if (prev === b) return;
          rag.querySelectorAll('button').forEach(x => x.setAttribute('aria-checked', 'false'));
          b.setAttribute('aria-checked', 'true');
          const row = rag.closest('[data-item]');
          const ragOf = btn => btn ? (btn.classList.contains('r') ? 'r' : btn.classList.contains('a') ? 'a' : 'g') : '';
          const prevRag = row.dataset.rag;
          row.dataset.rag = ragOf(b);
          if (window.onRagFlip) window.onRagFlip(row);
          let note = row.querySelector('.why-note');
          if (!note) {
            note = document.createElement('div');
            note.className = 'why-note flex items-center gap-2 mt-2';
            note.innerHTML = `<input placeholder="Why? (optional — lands on the audit trail)" class="text-sm border rounded px-2 py-1 flex-1" style="border-color:var(--outline-gray-2)">
              <button class="btn">Record</button>`;
            note.querySelector('.btn').onclick = () => {
              const why = note.querySelector('input').value.trim();
              note.remove();
              const flip = `${row.dataset.item}: ${prev ? prev.textContent.toLowerCase() : '—'} → ${b.textContent.toLowerCase()}`;
              const logRow = appendAuditRow('consent', flip, why);
              window.toast(`${row.dataset.item} → ${b.textContent}${why ? ' · note recorded' : ''}`, () => {
                rag.querySelectorAll('button').forEach(x => x.setAttribute('aria-checked', String(x === prev)));
                row.dataset.rag = prevRag;
                if (window.onRagFlip) window.onRagFlip(row);
                if (logRow) logRow.remove();
              });
            };
            row.appendChild(note);
            note.querySelector('input').focus();
          }
        });
      });
    });
  };
  function appendAuditRow(kind, text, why) {
    const log = document.getElementById('audit-rows'); if (!log) return null;
    const row = document.createElement('div');
    row.className = 'py-2.5 flex flex-wrap gap-x-3';
    const stamp = new Date().toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    row.innerHTML = `<span class="eyebrow tnum w-32">${stamp}</span>
      <span class="text-xs px-1.5 rounded" style="background:var(--surface-gray-2)">${kind}</span>
      <span>${text}</span>${why ? `<span class="eyebrow">why: “${why}”</span>` : ''}`;
    log.prepend(row);
    return row;
  }
  window.appendAuditRow = appendAuditRow;

  document.addEventListener('DOMContentLoaded', shell);
})();
