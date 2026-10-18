// Diagrams for the SQL track. Registered into the shared widget set with Lab.register, so a lesson
// or note can use them like any other: <div data-widget="sqltable" data-key="..."></div>.
//
//   sqltable     the practice tables drawn as tables: tap a row, a column or a cell to see what it is;
//                the primary key, and what MySQL says to a second row with the same id (data-table)
//   dbmap        who talks to whom: browser, lab app, Workbench, the port, the MySQL server, the
//                database, the tables; tap a box; type a port and "connect" (data-key)
//   wherefilter  build a WHERE test (column, sign, value) and watch every row get a yes or a no,
//                worked out row by row (data-table, data-column, data-op, data-value)
//
// The rows below are a COPY of app/sql/seed.sql (made-up data, public test card numbers). If the
// seed changes, change them here too. The tutor's test compares the two through the lab server.
// Every MySQL message shown here was produced by the real lab-mysql container (MySQL 8.4.11) or,
// for the port error, by the mysql program on Windows.
// Loaded after widgets.js in the lab (app/web/index.html) and on the phone site.
(function () {
  if (!window.Lab) return;
  const state = {};
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function btn(label, cls, onClick) { const b = el('button', cls, esc(label)); b.type = 'button'; b.addEventListener('click', onClick); return b; }

  // Whole paise shown as rupees with Indian commas: 1499900 -> "₹14,999.00".
  function rupees(paise) {
    const r = String(Math.floor(paise / 100)), p = paise % 100;
    let digits = r, out = '';
    if (digits.length > 3) {
      out = ',' + digits.slice(-3); digits = digits.slice(0, -3);
      while (digits.length > 2) { out = ',' + digits.slice(-2) + out; digits = digits.slice(0, -2); }
    }
    return '₹' + digits + out + '.' + String(p).padStart(2, '0');
  }

  const DATA = {
    customers: {
      columns: ['id', 'name', 'city', 'joined_on'], numeric: ['id'],
      about: { id: 'the customer\'s number, different for every customer', name: 'the customer\'s name', city: 'where the customer lives', joined_on: 'the day they joined, written year-month-day' },
      rows: [
        [1, 'Asha Rao', 'Pune', '2026-01-12'],
        [2, 'Vikram Shah', 'Mumbai', '2026-02-03'],
        [3, 'Meera Iyer', 'Chennai', '2026-02-20'],
        [4, 'Rahul Verma', 'Pune', '2026-03-15'],
        [5, 'Sara Khan', 'Delhi', '2026-04-02'],
        [6, 'Arjun Nair', 'Mumbai', '2026-05-09'],
      ],
      one: 'customer',
    },
    cards: {
      columns: ['id', 'customer_id', 'network', 'card_number', 'expires'], numeric: ['id', 'customer_id'],
      about: { id: 'the card\'s number in this table (not the card number)', customer_id: 'which customer owns the card: it holds an id from the customers table', network: 'which card network runs the card', card_number: 'a PUBLIC TEST number that payment companies publish for testing; no real person has it', expires: 'month/year the card stops working' },
      rows: [
        [1, 1, 'VISA', '4111111111111111', '12/29'],
        [2, 2, 'MASTERCARD', '5555555555554444', '08/28'],
        [3, 3, 'VISA', '4012888888881881', '03/30'],
        [4, 4, 'MASTERCARD', '5105105105105100', '11/27'],
        [5, 5, 'AMEX', '378282246310005', '06/29'],
        [6, 6, 'VISA', '4000056655665556', '01/31'],
        [7, 1, 'MASTERCARD', '2223003122003222', '09/30'],
      ],
      one: 'card',
    },
    merchants: {
      columns: ['id', 'name', 'city', 'category'], numeric: ['id'],
      about: { id: 'the shop\'s number, different for every shop', name: 'the shop\'s name (made up)', city: 'where the shop is', category: 'what kind of shop it is' },
      rows: [
        [1, 'Kettle and Cup', 'Pune', 'cafe'],
        [2, 'Page Turner Books', 'Mumbai', 'books'],
        [3, 'Fuel Stop 24', 'Chennai', 'fuel'],
        [4, 'Green Basket Grocers', 'Pune', 'grocery'],
        [5, 'Pixel Electronics', 'Delhi', 'electronics'],
      ],
      one: 'shop',
    },
    payments: {
      columns: ['id', 'card_id', 'merchant_id', 'amount_paise', 'status', 'created_at'], numeric: ['id', 'card_id', 'merchant_id', 'amount_paise'],
      about: { id: 'the payment\'s number, different for every payment', card_id: 'which card paid: an id from the cards table', merchant_id: 'which shop was paid: an id from the merchants table', amount_paise: 'how much, in whole paise, like your week 2 Till (100 paise = ₹1)', status: 'APPROVED (the bank said yes) or DECLINED (the bank said no)', created_at: 'when it happened: year-month-day hour:minute:second' },
      rows: [
        [1, 1, 1, 12000, 'APPROVED', '2026-10-01 09:15:00'],
        [2, 2, 2, 45000, 'APPROVED', '2026-10-01 11:40:00'],
        [3, 3, 3, 250000, 'APPROVED', '2026-10-02 18:05:00'],
        [4, 4, 4, 87550, 'APPROVED', '2026-10-03 10:20:00'],
        [5, 5, 5, 1499900, 'DECLINED', '2026-10-03 21:47:00'],
        [6, 1, 4, 32025, 'APPROVED', '2026-10-04 08:30:00'],
        [7, 6, 2, 100000, 'APPROVED', '2026-10-05 13:10:00'],
        [8, 7, 5, 349900, 'APPROVED', '2026-10-06 19:55:00'],
        [9, 2, 1, 9000, 'DECLINED', '2026-10-07 07:45:00'],
        [10, 3, 3, 150050, 'APPROVED', '2026-10-08 17:25:00'],
        [11, 4, 1, 99999, 'APPROVED', '2026-10-09 09:05:00'],
        [12, 5, 5, 1499900, 'APPROVED', '2026-10-09 21:50:00'],
      ],
      one: 'payment',
    },
  };
  // Lets a test or a later lesson read the same rows.
  Lab.sqlData = DATA;

  const css = `
  .sq-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
  .sq-tabs button { font-size: 14px; padding: 5px 12px; }
  .sq-tabs button.on { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
  .sq-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); }
  table.sq { border-collapse: collapse; width: 100%; font: 14px/1.35 var(--mono, Consolas, monospace); }
  table.sq th, table.sq td { padding: 6px 9px; border-bottom: 1px solid var(--line); text-align: left; white-space: nowrap; cursor: pointer; }
  table.sq.static th, table.sq.static td { cursor: auto; }
  table.sq th { background: var(--panel2); font-weight: 600; }
  table.sq th .pk { display: inline-block; font-size: 10px; letter-spacing: .5px; padding: 0 5px; margin-left: 5px; border-radius: 4px; background: var(--warn); color: var(--bg); vertical-align: 2px; }
  table.sq .row-on td { background: color-mix(in srgb, var(--blue) 20%, transparent); }
  table.sq .col-on { background: color-mix(in srgb, var(--accent) 20%, transparent); }
  table.sq td.cell-on { outline: 2px solid var(--warn); outline-offset: -2px; }
  table.sq tr.out td { opacity: .38; }
  table.sq td.yes { color: var(--accent); font-weight: 600; }
  table.sq td.no { color: var(--bad); }
  .sq-info { margin-top: 10px; font-size: 15px; line-height: 1.5; min-height: 3em; }
  .sq-info pre { margin: 6px 0; }
  .sq-err { color: var(--bad); font-family: var(--mono, Consolas, monospace); white-space: pre-wrap; overflow-wrap: anywhere; }
  .sq-ok { color: var(--accent); font-weight: 600; }
  .sq-map { display: grid; grid-template-columns: minmax(0, 1fr); gap: 4px; }
  .sq-two { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; }
  .sq-box { text-align: left; width: 100%; padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--panel); line-height: 1.3; }
  .sq-box b { display: block; font-size: 15px; }
  .sq-box span { font-size: 13px; color: var(--dim); }
  .sq-box.on { border-color: var(--accent); }
  .sq-box.server { border-style: solid; border-color: var(--blue); }
  .sq-box.door { border-style: dashed; text-align: center; }
  .sq-arrow { text-align: center; color: var(--dim); font: 13px var(--mono, Consolas, monospace); }
  .sq-inner { border: 2px dashed var(--line); border-radius: 12px; padding: 8px; display: grid; gap: 6px; }
  .sq-inner > .lbl { font-size: 12px; color: var(--dim); text-transform: uppercase; letter-spacing: 1px; }
  .sq-pick { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 10px; font-family: var(--mono, Consolas, monospace); }
  .sq-pick select, .sq-pick input { background: var(--panel); color: var(--text); border: 1px solid var(--line); border-radius: 8px; padding: 6px 8px; font: 15px var(--mono, Consolas, monospace); max-width: 100%; }
  .sq-pick input { width: 150px; }
  .sq-sql { font: 15px var(--mono, Consolas, monospace); background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; margin-bottom: 10px; overflow-x: auto; white-space: pre; }
  @media (max-width: 480px) { .sq-two { grid-template-columns: minmax(0, 1fr); } .sq-arrow.gap { display: none; } }
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  // ---- the practice tables: tap a row, a column or a cell ----
  function sqlTableWidget(node) {
    const key = node.dataset.key || 'sqltable';
    if (!state[key]) state[key] = { table: node.dataset.table || 'customers', row: -1, col: -1, msg: '' };
    const st = state[key];
    node.innerHTML = ''; node.className = 'bitsbox';
    const tabs = el('div', 'sq-tabs');
    const wrap = el('div', 'sq-wrap');
    const info = el('div', 'sq-info');
    const actions = el('div', 'wrow');
    function draw() {
      const T = DATA[st.table];
      tabs.innerHTML = '';
      Object.keys(DATA).forEach(name => {
        const b = btn(name, name === st.table ? 'on' : '', () => { st.table = name; st.row = -1; st.col = -1; st.msg = ''; draw(); });
        b.setAttribute('aria-pressed', name === st.table ? 'true' : 'false');
        tabs.append(b);
      });
      const t = el('table', 'sq');
      const head = el('tr');
      head.append(el('th', '', 'row'));
      T.columns.forEach((c, j) => {
        const th = el('th', j === st.col && st.row < 0 ? 'col-on' : '', esc(c) + (j === 0 ? '<span class="pk" title="primary key">KEY</span>' : ''));
        th.addEventListener('click', () => { st.col = j; st.row = -1; st.msg = ''; draw(); });
        head.append(th);
      });
      t.append(head);
      T.rows.forEach((r, i) => {
        const tr = el('tr', i === st.row && st.col < 0 ? 'row-on' : '');
        const num = el('td', 'muted', String(i + 1));
        num.addEventListener('click', () => { st.row = i; st.col = -1; st.msg = ''; draw(); });
        tr.append(num);
        r.forEach((v, j) => {
          const td = el('td', (j === st.col && st.row < 0 ? 'col-on' : '') + (i === st.row && j === st.col ? ' cell-on' : ''), esc(v));
          td.addEventListener('click', () => { st.row = i; st.col = j; st.msg = ''; draw(); });
          tr.append(td);
        });
        t.append(tr);
      });
      wrap.innerHTML = ''; wrap.append(t);

      if (st.msg) info.innerHTML = st.msg;
      else if (st.row >= 0 && st.col >= 0) {
        const c = T.columns[st.col], v = T.rows[st.row][st.col];
        let extra = '';
        if (c === 'amount_paise') extra = '<pre>' + v + ' paise ÷ 100 = ' + rupees(v).slice(1) + ' rupees\n= ' + rupees(v) + '</pre>';
        if (c === 'customer_id') { const who = DATA.customers.rows.find(x => x[0] === v); extra = '<br>Customer ' + v + ' in the customers table is <b>' + esc(who[1]) + '</b>.'; }
        if (c === 'card_id') { const card = DATA.cards.rows.find(x => x[0] === v); extra = '<br>Card ' + v + ' in the cards table is a ' + esc(card[2]) + ' card of customer ' + card[1] + '.'; }
        if (c === 'merchant_id') { const shop = DATA.merchants.rows.find(x => x[0] === v); extra = '<br>Merchant ' + v + ' is <b>' + esc(shop[1]) + '</b>.'; }
        info.innerHTML = '<b>One cell:</b> row ' + (st.row + 1) + ', column <code>' + esc(c) + '</code> holds <code>' + esc(v) + '</code>.' + extra;
      } else if (st.row >= 0) {
        info.innerHTML = '<b>One row</b> = one ' + T.one + ', with every fact about it: <code>' + T.rows[st.row].map(esc).join(' | ') + '</code>.' + (st.table === 'customers' ? ' Its id is ' + T.rows[st.row][0] + ', so "customer ' + T.rows[st.row][0] + '" means exactly this row.' : '');
      } else if (st.col >= 0) {
        const c = T.columns[st.col];
        info.innerHTML = '<b>One column</b> = one fact, for every ' + T.one + ': <code>' + esc(c) + '</code> is ' + esc(T.about[c]) + '.' + (st.col === 0 ? '<br>It is the <b>primary key</b>: no two rows may have the same value here, so an id points at exactly one row.' : '');
      } else {
        info.innerHTML = '<span class="muted">Tap a row number (left), a column name (top), or one cell. The table <code>' + st.table + '</code> has ' + T.rows.length + ' rows and ' + T.columns.length + ' columns.</span>';
      }
      actions.innerHTML = '';
      if (st.table === 'customers') {
        actions.append(btn('Add a customer with id 3', '', () => {
          st.row = 2; st.col = 0;
          st.msg = 'You asked: add <code>(3, \'Test Person\', \'Pune\', \'2026-10-18\')</code>. Customer 3 already exists (Meera Iyer), so MySQL refuses:<pre class="sq-err">ERROR 1062 (23000): Duplicate entry \'3\' for key \'customers.PRIMARY\'</pre><span class="muted">"Duplicate entry \'3\'": the id 3 is taken. "customers.PRIMARY": the rule that broke is the primary key of the customers table. Nothing was added.</span>';
          draw();
        }), btn('Add a customer with id 7', '', () => {
          st.row = -1; st.col = -1;
          st.msg = 'No customer has id 7 yet, so MySQL would accept this row and the table would have 7 rows.<br><span class="muted">This picture does not change the practice database. Adding rows is taught in a later SQL lesson.</span>';
          draw();
        }));
      }
    }
    node.append(tabs, wrap, info, actions);
    draw();
  }

  // ---- who talks to whom ----
  const MAP_INFO = {
    browser: '<b>Your browser</b> shows the lab page. It cannot talk to MySQL itself. It sends your query to the lab app at <code>http://localhost:4321</code>: address <code>localhost</code>, port 4321. <b>HTTP</b> is the language browsers and web servers use with each other; the <code>http://</code> at the start of an address says so.',
    lab: '<b>The lab app</b> is the Java program started by start.bat (app/Server.java). For every Run it starts the <b>mysql program</b>, a small client that comes with MySQL, hands it your query, and passes the answer back to the page.',
    workbench: '<b>MySQL Workbench</b> is another client: a window where you type queries. It dials the same server at the same door, with its own login (user <code>learner</code>).',
    door: '<b>Port 3308</b> is the door number. One computer runs many servers, and each one listens at its own numbered door. MySQL\'s usual door is 3306; the lab\'s practice server uses 3308 so it never clashes with anything else on your computer. Address <code>127.0.0.1</code> means "this same computer" (its name is <code>localhost</code>).',
    server: '<b>The MySQL server</b> is a program that runs all the time, waits for clients to connect, and answers their queries. It runs inside a Docker container called <code>lab-mysql</code>: a sealed box that holds MySQL and everything it needs, kept apart from the rest of your computer. <span class="later">Docker in depth: coming in the Docker track</span>',
    db: '<b>A database</b> is one named collection of tables inside the server. One server can hold many databases. The lab\'s is <code>payments_lab</code>.',
    tables: '<b>Tables</b> hold the data in rows and columns: customers, cards, merchants and payments.',
  };
  function dbMapWidget(node) {
    const key = node.dataset.key || 'dbmap';
    if (!state[key]) state[key] = { on: 'server', port: '3308', said: '' };
    const st = state[key];
    node.innerHTML = ''; node.className = 'bitsbox';
    const map = el('div', 'sq-map'), info = el('div', 'sq-info');
    const boxes = {};
    const box = (id, title, sub, cls) => {
      const b = el('button', 'sq-box' + (cls ? ' ' + cls : ''), '<b>' + title + '</b><span>' + sub + '</span>');
      b.type = 'button';
      b.addEventListener('click', () => { st.on = id; st.said = ''; draw(); });
      boxes[id] = b;
      return b;
    };
    const arrow = text => el('div', 'sq-arrow', text);
    const clients = el('div', 'sq-two');
    const left = el('div', 'sq-map');
    left.append(box('browser', 'Your browser', 'the lab page'), arrow('↓ HTTP, port 4321'), box('lab', 'Lab app', 'Server.java + the mysql program'));
    const right = el('div', 'sq-map');
    const gap = () => { const a = arrow('&nbsp;'); a.classList.add('gap'); return a; };
    right.append(box('workbench', 'MySQL Workbench', 'a window for queries'), gap(), gap());
    clients.append(left, right);
    const inner = el('div', 'sq-inner');
    inner.append(el('div', 'lbl', 'Docker container lab-mysql'), box('server', 'MySQL server', 'waits for connections, answers queries', 'server'), arrow('↓ holds'), box('db', 'Database payments_lab', 'one named set of tables'), arrow('↓ holds'), box('tables', 'Tables', 'customers · cards · merchants · payments'));
    map.append(el('div', 'muted', 'Clients: programs that ask'), clients, arrow('↓ both connect to 127.0.0.1 : 3308 ↓'), box('door', 'Door (port) 3308', 'on this computer, 127.0.0.1', 'door'), arrow('↓'), inner);

    const tryRow = el('div', 'wline');
    const input = el('input'); input.type = 'text'; input.inputMode = 'numeric'; input.value = st.port; input.id = key + '-port'; input.setAttribute('aria-label', 'Port to connect to');
    tryRow.append(el('span', '', 'Connect to 127.0.0.1 port'), input);
    const go = btn('Connect', 'primary', () => {
      st.port = input.value.trim(); st.on = 'door';
      if (!/^\d+$/.test(st.port) || Number(st.port) < 1 || Number(st.port) > 65535) st.said = '<span class="sq-err">A port is a whole number from 1 to 65535. "' + esc(st.port) + '" is not one.</span>';
      else if (st.port === '3308') st.said = '<span class="sq-ok">Connected.</span> Someone is listening at door 3308: the lab\'s MySQL server. It checks the user name and password, then gives this connection a number and keeps the line open until the client hangs up.';
      else st.said = 'In this picture nobody listens at door ' + esc(st.port) + ', so the call is refused. The mysql program on Windows says:<pre class="sq-err">ERROR 2003 (HY000): Can\'t connect to MySQL server on \'127.0.0.1:' + esc(st.port) + '\' (10061)</pre><span class="muted">2003 is MySQL\'s number for "could not reach the server". 10061 is Windows\' number for "connection refused": the door is closed. Workbench shows the same "Can\'t connect to MySQL server" text. The fix is the right port, or starting the server.</span>';
      draw();
    });
    tryRow.append(go);
    function draw() {
      Object.keys(boxes).forEach(id => boxes[id].classList.toggle('on', id === st.on));
      info.innerHTML = MAP_INFO[st.on] + (st.said ? '<div style="margin-top:8px">' + st.said + '</div>' : '');
    }
    node.append(map, info, el('div', 'muted', 'Tap any box. Then try a door number below: 3308, then any other.'), tryRow);
    draw();
  }

  // ---- WHERE, row by row ----
  // MySQL compares text in this database without caring about capitals ('pune' = 'Pune'), so this does too.
  function whereWidget(node) {
    const key = node.dataset.key || 'wherefilter';
    if (!state[key]) state[key] = { table: node.dataset.table || 'customers', col: node.dataset.column || 'city', op: node.dataset.op || '=', value: node.dataset.value || 'Pune' };
    const st = state[key];
    node.innerHTML = ''; node.className = 'bitsbox';
    const pick = el('div', 'sq-pick'), sqlLine = el('div', 'sq-sql'), wrap = el('div', 'sq-wrap'), info = el('div', 'sq-info');
    const tableSel = el('select'), colSel = el('select'), opSel = el('select'), val = el('input');
    tableSel.setAttribute('aria-label', 'Table'); colSel.setAttribute('aria-label', 'Column'); opSel.setAttribute('aria-label', 'Comparison sign'); val.setAttribute('aria-label', 'Value');
    val.id = key + '-value';
    ['customers', 'payments'].forEach(t => tableSel.append(new Option(t, t)));
    ['=', '>', '<', '>=', '<=', '<>'].forEach(o => opSel.append(new Option(o, o)));
    function fillCols() {
      colSel.innerHTML = '';
      DATA[st.table].columns.forEach(c => colSel.append(new Option(c, c)));
      if (!DATA[st.table].columns.includes(st.col)) st.col = DATA[st.table].columns[0];
      colSel.value = st.col;
    }
    tableSel.value = st.table; fillCols(); opSel.value = st.op; val.value = st.value;
    tableSel.addEventListener('change', () => { st.table = tableSel.value; fillCols(); draw(); });
    colSel.addEventListener('change', () => { st.col = colSel.value; draw(); });
    opSel.addEventListener('change', () => { st.op = opSel.value; draw(); });
    val.addEventListener('input', () => { st.value = val.value; draw(); });
    pick.append(el('span', '', 'WHERE'), colSel, opSel, val, el('span', 'muted', 'in'), tableSel);
    const test = (a, op, b) => op === '=' ? a === b : op === '>' ? a > b : op === '<' ? a < b : op === '>=' ? a >= b : op === '<=' ? a <= b : a !== b;
    function draw() {
      const T = DATA[st.table], j = T.columns.indexOf(st.col), isNum = T.numeric.includes(st.col);
      const raw = st.value.trim();
      // Never change what he typed: a value this column cannot hold gets a message instead.
      if (raw === '') { sqlLine.textContent = 'SELECT * FROM ' + st.table + ' WHERE ' + st.col + ' ' + st.op + ' ...;'; info.innerHTML = 'Type a value to compare with.'; wrap.innerHTML = ''; return; }
      if (isNum && !/^-?\d+$/.test(raw)) { sqlLine.textContent = 'SELECT * FROM ' + st.table + ' WHERE ' + st.col + ' ' + st.op + ' ' + raw + ';'; info.innerHTML = '<span class="sq-err"><code>' + esc(st.col) + '</code> holds whole numbers, and "' + esc(raw) + '" is not a whole number. Type digits only, with no commas, no ₹ and no quotes.</span>'; wrap.innerHTML = ''; return; }
      const shown = isNum ? raw : "'" + raw.replace(/'/g, "''") + "'";
      sqlLine.textContent = 'SELECT * FROM ' + st.table + ' WHERE ' + st.col + ' ' + st.op + ' ' + shown + ';';
      const t = el('table', 'sq'), head = el('tr');
      head.append(el('th', '', 'the test'));
      T.columns.forEach((c, k) => head.append(el('th', k === j ? 'col-on' : '', esc(c))));
      t.append(head);
      let kept = 0;
      T.rows.forEach(r => {
        const v = r[j];
        const ok = isNum ? test(v, st.op, Number(raw)) : test(String(v).toLowerCase(), st.op, raw.toLowerCase());
        if (ok) kept++;
        const tr = el('tr', ok ? '' : 'out');
        const lhs = isNum ? v : "'" + v + "'";
        tr.append(el('td', ok ? 'yes' : 'no', esc(lhs + ' ' + st.op + ' ' + shown) + (ok ? ' → yes, keep' : ' → no')));
        r.forEach((x, k) => tr.append(el('td', k === j ? 'col-on' : '', esc(x))));
        t.append(tr);
      });
      wrap.innerHTML = ''; wrap.append(t);
      let msg = '<b>' + kept + ' of ' + T.rows.length + ' rows pass</b> and come back. The faded rows are left out.<br>';
      if (!isNum && st.op !== '=' && st.op !== '<>') msg += '<br><span class="muted">For text, &gt; and &lt; mean "after" and "before" in dictionary order.</span>';
      if (!isNum && /^\d+$/.test(raw)) msg += '<br><span class="muted">' + esc(st.col) + ' holds text, so the value is compared as text, in quotes.</span>';
      if (isNum && st.col === 'amount_paise') msg += Number(raw) >= 0 ? '<pre>' + raw + ' paise ÷ 100 = ' + rupees(Number(raw)) + '</pre>' : '';
      info.innerHTML = msg + '<span class="muted">Text values sit in quotes; numbers do not. In this picture the quotes are added for you. In a real query you type them.</span>';
    }
    node.append(pick, sqlLine, wrap, info);
    draw();
  }

  Lab.register('sqltable', sqlTableWidget);
  Lab.register('dbmap', dbMapWidget);
  Lab.register('wherefilter', whereWidget);
})();
