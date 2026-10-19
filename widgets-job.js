// Diagrams for the "From the job" track (missions/job.js). Registered with Lab.register like the SQL ones.
//
//   txntimeline  two connections, A and B, step by step: tap Next and watch three boxes change: what is
//                SAVED (what everyone sees), A's DRAFT and B's DRAFT, plus who holds a lock and who is
//                waiting. data-scenario picks the story:
//                  draft  a transfer inside BEGIN ... COMMIT, while B reads (job lesson 1)
//                  wrong  the bug: the job's check runs on another connection and sees nothing (lesson 1)
//                  race   two apps take the last free card at the same moment (job lesson 2)
//                  guard  the same race, with AND status = 'free' in the UPDATE (lesson 2)
//                  lock   the same race, with BEGIN + SELECT ... FOR UPDATE (lesson 2)
//
// Every state below is what the lab-mysql container (MySQL 8.4.11) really showed when the same steps were
// run through /api/sql-session on 2026-10-20 (the lesson's two-window blocks run them again live).
// Loaded after widgets-sql.js in the lab and on the phone site.
(function () {
  if (!window.Lab) return;
  const state = {};
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function btn(label, cls, onClick) { const b = el('button', cls, esc(label)); b.type = 'button'; b.addEventListener('click', onClick); return b; }

  const css = `
  .tx-steps { list-style: none; margin: 0 0 10px; padding: 0; font: 14px/1.45 var(--mono, Consolas, monospace); }
  .tx-steps li { padding: 4px 8px; border-radius: 6px; color: var(--dim); display: flex; gap: 8px; }
  .tx-steps li.now { background: var(--panel2); color: var(--text); outline: 1px solid var(--line); }
  .tx-steps li.done { color: var(--text); }
  .tx-steps .w { font-weight: 700; min-width: 18px; } .tx-steps .wa { color: var(--blue); } .tx-steps .wb { color: var(--warn); }
  .tx-boxes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .tx-box { border: 1px solid var(--line); border-radius: 8px; padding: 8px; min-width: 0; }
  .tx-box h4 { margin: 0 0 6px; font-size: 13px; } .tx-box.saved h4 { color: var(--accent); }
  .tx-box.da h4 { color: var(--blue); } .tx-box.db h4 { color: var(--warn); }
  .tx-box table { border-collapse: collapse; width: 100%; font: 13px/1.4 var(--mono, Consolas, monospace); }
  .tx-box td { padding: 2px 4px; border-bottom: 1px solid var(--line); overflow-wrap: anywhere; }
  .tx-box td.ch { color: var(--warn); font-weight: 700; }
  .tx-box .none { color: var(--dim); font-size: 13px; }
  .tx-said { margin-top: 10px; font-size: 14.5px; }
  .tx-said .bad { color: var(--bad); font-weight: 600; } .tx-said .ok { color: var(--accent); font-weight: 600; }
  .tx-row { display: flex; gap: 8px; margin-top: 10px; align-items: center; flex-wrap: wrap; }
  @media (max-width: 560px) { .tx-boxes { grid-template-columns: 1fr; } }
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  // A table state is a list of rows; a draft of null means "no transaction open".
  const AC = (asha, ravi) => [['Asha', asha], ['Ravi', ravi]];
  const CARDS = (o7, o8) => [['7', o7 ? 'taken' : 'free', o7 || 'NULL'], ['8', o8 ? 'taken' : 'free', o8 || 'NULL']];

  const SCENARIOS = {
    draft: {
      cols: ['name', 'balance_rupees'],
      steps: [
        { w: 'A', sql: 'BEGIN;', saved: AC(1000, 1000), a: AC(1000, 1000), b: null, said: 'A opens a draft. Nothing has changed yet.' },
        { w: 'A', sql: "UPDATE accounts SET balance_rupees = balance_rupees - 300 WHERE name = 'Asha';", saved: AC(1000, 1000), a: AC(700, 1000), b: null, ch: 'a0', said: 'Only A\'s draft changes: Asha 1000 − 300 = 700. Saved still says 1000.' },
        { w: 'B', sql: 'SELECT * FROM accounts;', saved: AC(1000, 1000), a: AC(700, 1000), b: null, said: 'B sees only what is saved: <span class="ok">Asha 1000, Ravi 1000</span>. A\'s draft is invisible to B.' },
        { w: 'A', sql: "UPDATE accounts SET balance_rupees = balance_rupees + 300 WHERE name = 'Ravi';", saved: AC(1000, 1000), a: AC(700, 1300), b: null, ch: 'a1', said: 'Ravi 1000 + 300 = 1300, still only in the draft.' },
        { w: 'A', sql: 'COMMIT;', saved: AC(700, 1300), a: null, b: null, ch: 's01', said: 'COMMIT publishes both changes at once. The draft is gone; saved is the new truth.' },
        { w: 'B', sql: 'SELECT * FROM accounts;', saved: AC(700, 1300), a: null, b: null, said: 'Now B sees <span class="ok">Asha 700, Ravi 1300</span>. The total is still 700 + 1300 = 2000.' },
      ],
    },
    wrong: {
      cols: ['branch', 'card_type'],
      steps: [
        { w: 'A', sql: 'BEGIN;', saved: [['Pune', 'Silver']], a: [['Pune', 'Silver']], b: null, said: 'The approval job opens a draft in connection A.' },
        { w: 'A', sql: "INSERT INTO approvals (branch, card_type) VALUES ('Pune', 'Gold');", saved: [['Pune', 'Silver']], a: [['Pune', 'Silver'], ['Pune', 'Gold']], b: null, ch: 'a1', said: 'The new approval exists only in A\'s draft.' },
        { w: 'B', sql: "SELECT * FROM approvals WHERE card_type = 'Gold';", saved: [['Pune', 'Silver']], a: [['Pune', 'Silver'], ['Pune', 'Gold']], b: null, said: 'The safety check ran on a DIFFERENT connection, B. B sees only what is saved: <span class="bad">no Gold row</span>. The check says "not approved".' },
        { w: 'A', sql: 'ROLLBACK;', saved: [['Pune', 'Silver']], a: null, b: null, said: 'Because the check said no, the job throws its draft away. The approval that was just made is lost.' },
      ],
    },
    race: {
      cols: ['id', 'status', 'owner'],
      steps: [
        { w: 'A', sql: "SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1;", saved: CARDS(), a: null, b: null, said: 'Asha\'s app asks for a free card: <b>7</b>.' },
        { w: 'B', sql: "SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1;", saved: CARDS(), a: null, b: null, said: 'At the same moment Ravi\'s app asks: also <b>7</b>. Nothing is taken yet, so both see the same card.' },
        { w: 'A', sql: "UPDATE cards SET status = 'taken', owner = 'Asha' WHERE id = 7;", saved: CARDS('Asha'), a: null, b: null, ch: 's0', said: 'Asha\'s app takes card 7. 1 row changed. It tells Asha: "card 7 is yours".' },
        { w: 'B', sql: "UPDATE cards SET status = 'taken', owner = 'Ravi' WHERE id = 7;", saved: CARDS('Ravi'), a: null, b: null, ch: 's0', said: 'Ravi\'s app also takes card 7. 1 row changed, no error. It tells Ravi: "card 7 is yours". <span class="bad">Card 7 was handed out twice</span>, and Asha\'s record is overwritten.' },
      ],
    },
    guard: {
      cols: ['id', 'status', 'owner'],
      steps: [
        { w: 'A', sql: "SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1;", saved: CARDS(), a: null, b: null, said: 'Both apps read card 7 as free, as before.' },
        { w: 'B', sql: "SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1;", saved: CARDS(), a: null, b: null, said: 'Ravi\'s app also sees 7.' },
        { w: 'A', sql: "UPDATE cards SET status = 'taken', owner = 'Asha' WHERE id = 7 AND status = 'free';", saved: CARDS('Asha'), a: null, b: null, ch: 's0', said: 'Card 7 is free, so both tests are true: <span class="ok">1 row changed</span>. Asha has card 7.' },
        { w: 'B', sql: "UPDATE cards SET status = 'taken', owner = 'Ravi' WHERE id = 7 AND status = 'free';", saved: CARDS('Asha'), a: null, b: null, said: 'Card 7 is taken now, so <code>status = \'free\'</code> is false: <span class="ok">0 rows changed</span>. Ravi\'s app sees the 0 and knows it lost.' },
        { w: 'B', sql: "SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1;", saved: CARDS('Asha'), a: null, b: null, said: 'So it asks again: <b>8</b>.' },
        { w: 'B', sql: "UPDATE cards SET status = 'taken', owner = 'Ravi' WHERE id = 8 AND status = 'free';", saved: CARDS('Asha', 'Ravi'), a: null, b: null, ch: 's1', said: '1 row changed. <span class="ok">Each person has a different card.</span>' },
      ],
    },
    lock: {
      cols: ['id', 'status', 'owner'],
      steps: [
        { w: 'A', sql: 'BEGIN;', saved: CARDS(), a: CARDS(), b: null, said: 'Asha\'s app opens a draft.' },
        { w: 'A', sql: "SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1 FOR UPDATE;", saved: CARDS(), a: CARDS(), b: null, lock: 'A locks card 7', said: 'It reads <b>7</b> and FOR UPDATE <b>locks</b> that row until A commits or rolls back.' },
        { w: 'B', sql: 'BEGIN;', saved: CARDS(), a: CARDS(), b: CARDS(), lock: 'A locks card 7', said: 'Ravi\'s app opens its own draft.' },
        { w: 'B', sql: "SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1 FOR UPDATE;", saved: CARDS(), a: CARDS(), b: CARDS(), lock: 'A locks card 7 · B is WAITING', said: 'B also wants to lock a free card. Card 7 is locked by A, so <b>B waits</b>. Its answer does not come yet.' },
        { w: 'A', sql: "UPDATE cards SET status = 'taken', owner = 'Asha' WHERE id = 7;", saved: CARDS(), a: CARDS('Asha'), b: CARDS(), ch: 'a0', lock: 'A locks card 7 · B is WAITING', said: 'Asha\'s app takes card 7 in its draft.' },
        { w: 'A', sql: 'COMMIT;', saved: CARDS('Asha'), a: null, b: CARDS('Asha'), ch: 's0', lock: 'B locks card 8', said: 'A commits: the lock is released. B\'s waiting read now runs on the saved table: card 7 is taken, so it gets <b>8</b>.' },
        { w: 'B', sql: "UPDATE cards SET status = 'taken', owner = 'Ravi' WHERE id = 8;", saved: CARDS('Asha'), a: null, b: CARDS('Asha', 'Ravi'), ch: 'b1', lock: 'B locks card 8', said: 'Ravi\'s app takes card 8 in its draft.' },
        { w: 'B', sql: 'COMMIT;', saved: CARDS('Asha', 'Ravi'), a: null, b: null, ch: 's1', said: '<span class="ok">Each person has a different card</span>, and nobody had to try twice.' },
      ],
    },
  };

  function tableOf(rows, cols, changedRows) {
    if (!rows) return el('div', 'none', 'No draft open.');
    const t = el('table');
    rows.forEach((r, i) => {
      const tr = el('tr');
      r.forEach(v => tr.append(el('td', changedRows.includes(i) ? 'ch' : '', esc(v))));
      t.append(tr);
    });
    return t;
  }

  function txnTimeline(node) {
    const name = node.dataset.scenario || 'draft', sc = SCENARIOS[name];
    const key = node.dataset.key || 'tx-' + name;
    if (!state[key]) state[key] = { at: -1 };
    const st = state[key];
    node.innerHTML = ''; node.className = 'bitsbox';
    if (!sc) { node.append(el('div', 'none', 'Unknown picture: ' + esc(name))); return; }
    const draw = () => {
      node.innerHTML = '';
      const list = el('ol', 'tx-steps');
      sc.steps.forEach((s, i) => {
        const li = el('li', i === st.at ? 'now' : i < st.at ? 'done' : '');
        li.append(el('span', 'w ' + (s.w === 'A' ? 'wa' : 'wb'), s.w), el('span', '', esc(s.sql)));
        list.append(li);
      });
      node.append(list);
      const s = sc.steps[Math.max(0, st.at)], show = st.at >= 0;
      const changed = (show && s.ch) || '';
      const row = p => changed.startsWith(p) ? changed.slice(1).split('').map(Number) : [];
      const boxes = el('div', 'tx-boxes');
      const box = (cls, title, rows, p) => { const b = el('div', 'tx-box ' + cls); b.append(el('h4', '', title), tableOf(rows, sc.cols, row(p))); return b; };
      const first = { saved: sc.steps[0].saved };
      boxes.append(
        box('saved', 'Saved: everyone sees this', show ? s.saved : first.saved, 's'),
        box('da', 'A\'s draft', show ? s.a : null, 'a'),
        box('db', 'B\'s draft', show ? s.b : null, 'b'));
      node.append(boxes);
      node.append(el('div', 'tx-said', show ? (s.lock ? '<b>Locks:</b> ' + esc(s.lock) + '<br>' : '') + s.said : 'Tap Next to run step 1.'));
      const r = el('div', 'tx-row');
      const back = btn('Back', '', () => { st.at = Math.max(-1, st.at - 1); draw(); });
      const next = btn(st.at >= sc.steps.length - 1 ? 'Start again' : 'Next', 'primary', () => { st.at = st.at >= sc.steps.length - 1 ? -1 : st.at + 1; draw(); });
      back.disabled = st.at < 0;
      r.append(back, next, el('span', 'muted', show ? 'Step ' + (st.at + 1) + ' of ' + sc.steps.length : ''));
      node.append(r);
    };
    draw();
  }

  Lab.register('txntimeline', txnTimeline);
})();
